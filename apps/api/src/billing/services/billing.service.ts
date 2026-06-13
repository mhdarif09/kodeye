import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  BillingMode,
  CouponType,
  InvoiceStatus,
  PaymentProvider,
  PaymentStatus,
  Prisma,
  SubscriptionStatus,
} from '@prisma/client';
import { OrganizationsService } from '../../organizations/organizations.service';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { ExchangeRateService } from './exchange-rate.service';
import { AppSettingsService } from '../../settings/app-settings.service';

@Injectable()
export class BillingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly organizations: OrganizationsService,
    private readonly fx: ExchangeRateService,
    private readonly config: AppSettingsService,
  ) {}
  currencies() {
    return this.prisma.currency.findMany({
      where: { isActive: true },
      orderBy: { code: 'asc' },
    });
  }
  async plans(currencyCode: string) {
    const plans = await this.prisma.plan.findMany({
      include: { prices: { where: { currencyCode, isActive: true } } },
      where: { isActive: true },
      orderBy: { basePriceIdr: 'asc' },
    });
    return Promise.all(
      plans.map(async (plan) => {
        const override = plan.prices[0];
        let amount = override?.amount ?? plan.basePriceIdr ?? 0;
        let snapshot: object | null = null;
        let estimated = false;
        if (!override && currencyCode !== 'IDR' && plan.basePriceIdr !== null) {
          const converted = await this.fx.convertMinorAmount(
            plan.basePriceIdr,
            'IDR',
            currencyCode,
          );
          amount = converted.amount;
          snapshot = converted.snapshot;
          estimated = true;
        }
        return {
          ...plan,
          amount,
          currencyCode,
          exchangeRateSnapshot: snapshot,
          isEstimated: estimated,
          prices: undefined,
          providerAvailability: {
            midtrans: currencyCode === 'IDR',
            paypal: ['USD', 'EUR', 'SGD'].includes(currencyCode),
          },
        };
      }),
    );
  }
  async current(userId: string, organizationId: string) {
    await this.organizations.findAccessibleById(userId, organizationId);
    let subscription = await this.prisma.subscription.findUnique({
      include: { plan: true },
      where: { organizationId },
    });
    if (!subscription) {
      const free = await this.prisma.plan.findUniqueOrThrow({
        where: { code: 'free' },
      });
      subscription = await this.prisma.subscription.create({
        data: {
          billingMode: BillingMode.ONE_TIME,
          currencyCode: 'IDR',
          organizationId,
          planId: free.id,
          status: SubscriptionStatus.FREE,
        },
        include: { plan: true },
      });
    }
    const start = new Date();
    start.setUTCDate(1);
    start.setUTCHours(0, 0, 0, 0);
    const [repositories, scans] = await Promise.all([
      this.prisma.repository.count({ where: { organizationId } }),
      this.prisma.scanJob.count({
        where: { organizationId, createdAt: { gte: start } },
      }),
    ]);
    return { ...subscription, usage: { repositories, scansThisMonth: scans } };
  }
  async quote(planCode: string, currencyCode: string, couponCode?: string) {
    const plan = (await this.plans(currencyCode)).find(
      (item) => item.code === planCode,
    );
    if (!plan || plan.requiresManualApproval)
      throw new BadRequestException(
        'Plan is not available for automatic checkout',
      );
    let coupon = null;
    let discountAmount = 0;
    if (couponCode) {
      coupon = await this.prisma.coupon.findUnique({
        include: { amounts: true },
        where: { code: couponCode.trim().toUpperCase() },
      });
      if (
        !coupon ||
        !coupon.isActive ||
        (coupon.validFrom && coupon.validFrom > new Date()) ||
        (coupon.validUntil && coupon.validUntil < new Date()) ||
        (coupon.appliesToPlanCode && coupon.appliesToPlanCode !== planCode) ||
        (coupon.maxRedemptions && coupon.redeemedCount >= coupon.maxRedemptions)
      )
        throw new BadRequestException('Coupon is invalid or expired');
      if (coupon.type === CouponType.PERCENT)
        discountAmount = Math.round(
          (plan.amount * Number(coupon.percentOff ?? 0)) / 100,
        );
      else {
        const fixed = coupon.amounts.find(
          (item) => item.currencyCode === currencyCode,
        );
        if (!fixed)
          throw new BadRequestException(
            'This coupon is not available for the selected currency.',
          );
        discountAmount = fixed.amountOff;
      }
    }
    discountAmount = Math.min(discountAmount, plan.amount);
    const taxableAmount = plan.amount - discountAmount;
    const taxRate =
      this.config.get('BILLING_TAX_ENABLED', 'true') === 'true'
        ? new Prisma.Decimal(
            this.config.get('BILLING_DEFAULT_TAX_RATE', '0.11'),
          )
        : new Prisma.Decimal(0);
    const taxAmount = Number(
      new Prisma.Decimal(taxableAmount)
        .mul(taxRate)
        .toDecimalPlaces(0)
        .toString(),
    );
    return {
      coupon,
      currencyCode,
      discountAmount,
      exchangeRateSnapshot: plan.exchangeRateSnapshot,
      plan,
      subtotalAmount: plan.amount,
      taxableAmount,
      taxAmount,
      taxLabel: this.config.get('BILLING_TAX_LABEL', 'PPN'),
      taxRate,
      totalAmount: taxableAmount + taxAmount,
    };
  }
  async assertLimits(
    organizationId: string,
    kind: 'auto' | 'pdf' | 'repository' | 'scan',
  ) {
    const subscription = await this.prisma.subscription.findUnique({
      include: { plan: true },
      where: { organizationId },
    });
    const plan =
      subscription?.plan ??
      (await this.prisma.plan.findUnique({ where: { code: 'free' } }));
    if (!plan) return;
    if (kind === 'auto' && !plan.enableGithubAutoScan)
      throw new BadRequestException(
        'GitHub automatic scanning is not available on the current plan.',
      );
    if (kind === 'pdf' && !plan.enablePdfReport)
      throw new BadRequestException(
        'PDF reports are not available on the current plan.',
      );
    if (
      kind === 'repository' &&
      (await this.prisma.repository.count({ where: { organizationId } })) >=
        plan.maxRepositories
    )
      throw new BadRequestException(
        'Repository limit reached for the current plan.',
      );
    if (kind === 'scan') {
      const start = new Date();
      start.setUTCDate(1);
      start.setUTCHours(0, 0, 0, 0);
      if (
        (await this.prisma.scanJob.count({
          where: { organizationId, createdAt: { gte: start } },
        })) >= plan.maxScansPerMonth
      )
        throw new BadRequestException(
          'Monthly scan limit reached for the current plan.',
        );
    }
  }
  async listPayments(userId: string, organizationId: string) {
    await this.organizations.findAccessibleById(userId, organizationId);
    return this.prisma.payment.findMany({
      omit: { rawResponseJson: true, snapToken: true },
      orderBy: { createdAt: 'desc' },
      where: { organizationId },
    });
  }
  async payment(userId: string, id: string) {
    const payment = await this.prisma.payment.findFirst({
      include: { invoice: true, plan: true },
      omit: { rawResponseJson: true, snapToken: true },
      where: {
        id,
        organization: {
          OR: [{ ownerUserId: userId }, { members: { some: { userId } } }],
        },
      },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }
  async listInvoices(userId: string, organizationId: string) {
    await this.organizations.findAccessibleById(userId, organizationId);
    return this.prisma.invoice.findMany({
      include: { lineItems: true },
      orderBy: { issuedAt: 'desc' },
      where: { organizationId },
    });
  }
  async invoice(userId: string, id: string) {
    const invoice = await this.prisma.invoice.findFirst({
      include: {
        lineItems: true,
        organization: true,
        payment: { include: { plan: true } },
      },
      where: {
        id,
        organization: {
          OR: [{ ownerUserId: userId }, { members: { some: { userId } } }],
        },
      },
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    return invoice;
  }
  async activatePaid(paymentId: string, transactionId?: string) {
    const payment = await this.prisma.payment.findUnique({
      include: { plan: true },
      where: { id: paymentId },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    if (payment.status === PaymentStatus.PAID) return payment;
    return this.prisma.$transaction(async (tx) => {
      const claim = await tx.payment.updateMany({
        data: {
          externalTransactionId: transactionId,
          paidAt: new Date(),
          status: PaymentStatus.PAID,
        },
        where: { id: payment.id, status: { not: PaymentStatus.PAID } },
      });
      if (claim.count === 0)
        return tx.payment.findUniqueOrThrow({ where: { id: payment.id } });
      const paid = await tx.payment.findUniqueOrThrow({
        where: { id: payment.id },
      });
      if (payment.couponId) {
        await tx.couponUsage.create({
          data: {
            couponId: payment.couponId,
            currencyCode: payment.currencyCode,
            discountAmount: payment.discountAmount,
            organizationId: payment.organizationId,
            paymentId: payment.id,
          },
        });
        await tx.coupon.update({
          data: { redeemedCount: { increment: 1 } },
          where: { id: payment.couponId },
        });
      }
      const subscription = await tx.subscription.upsert({
        create: {
          billingMode: payment.billingMode,
          currencyCode: payment.currencyCode,
          organizationId: payment.organizationId,
          planId: payment.planId,
          status: SubscriptionStatus.ACTIVE,
        },
        update: {
          billingMode: payment.billingMode,
          currencyCode: payment.currencyCode,
          planId: payment.planId,
          status: SubscriptionStatus.ACTIVE,
        },
        where: { organizationId: payment.organizationId },
      });
      await tx.invoice.create({
        data: {
          currencyCode: payment.currencyCode,
          discountAmount: payment.discountAmount,
          exchangeRateSnapshot: payment.exchangeRateSnapshot ?? undefined,
          invoiceNumber: `INV-${Date.now()}-${payment.id.slice(-6).toUpperCase()}`,
          lineItems: {
            create: {
              currencyCode: payment.currencyCode,
              description: payment.plan.name,
              totalAmount: payment.subtotalAmount,
              unitAmount: payment.subtotalAmount,
            },
          },
          organizationId: payment.organizationId,
          paidAt: new Date(),
          paymentId: payment.id,
          status: InvoiceStatus.PAID,
          subscriptionId: subscription.id,
          subtotalAmount: payment.subtotalAmount,
          taxableAmount: payment.taxableAmount,
          taxAmount: payment.taxAmount,
          taxLabel: payment.taxLabel,
          taxRate: payment.taxRate,
          totalAmount: payment.totalAmount,
        },
      });
      return paid;
    });
  }
  paymentData(
    organizationId: string,
    provider: PaymentProvider,
    billingMode: BillingMode,
    quote: Awaited<ReturnType<BillingService['quote']>>,
  ) {
    return {
      amount: quote.totalAmount,
      billingMode,
      couponId: quote.coupon?.id,
      currencyCode: quote.currencyCode,
      discountAmount: quote.discountAmount,
      exchangeRateSnapshot: quote.exchangeRateSnapshot ?? undefined,
      organizationId,
      planId: quote.plan.id,
      provider,
      status: PaymentStatus.PENDING,
      subtotalAmount: quote.subtotalAmount,
      taxableAmount: quote.taxableAmount,
      taxAmount: quote.taxAmount,
      taxLabel: quote.taxLabel,
      taxRate: quote.taxRate,
      totalAmount: quote.totalAmount,
    };
  }
}
