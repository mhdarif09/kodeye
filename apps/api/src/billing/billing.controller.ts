import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Query,
  RawBodyRequest,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { BillingMode, PaymentProvider, Prisma, UserRole } from '@prisma/client';
import type { Request, Response } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import type { AuthenticatedUser } from '../common/types/authenticated-user.type';
import { OrganizationsService } from '../organizations/organizations.service';
import { ReportPdfService } from '../reports/report-pdf.service';
import {
  CapturePayPalDto,
  CheckoutDto,
  CouponDto,
  CurrencyQueryDto,
  EnterpriseRequestDto,
  ExchangeRateQueryDto,
  OrganizationQueryDto,
  PlanPriceDto,
  UpdatePlanDto,
  VerifySubscriptionDto,
} from './dto/billing.dto';
import { PaymentProvidersService } from './providers/payment-providers.service';
import { BillingService } from './services/billing.service';
import { ExchangeRateService } from './services/exchange-rate.service';
import { PrismaService } from '../infrastructure/prisma/prisma.service';
import { AppSettingsService } from '../settings/app-settings.service';

@Controller()
export class BillingController {
  constructor(
    private readonly billing: BillingService,
    private readonly fx: ExchangeRateService,
    private readonly prisma: PrismaService,
    private readonly providers: PaymentProvidersService,
    private readonly organizations: OrganizationsService,
    private readonly pdf: ReportPdfService,
    private readonly config: AppSettingsService,
  ) {}
  @Get('currencies') currencies() {
    return this.billing.currencies();
  }
  @Get('plans') plans(@Query() query: CurrencyQueryDto) {
    return this.billing.plans(query.currency);
  }
  @Get('exchange-rates') rate(@Query() query: ExchangeRateQueryDto) {
    return this.fx.getRate(query.base, query.quote);
  }
  @Get('coupons/validate') async coupon(
    @Query('code') code: string,
    @Query('planCode') planCode: string,
    @Query('currencyCode') currency: string,
  ) {
    return this.billing.quote(planCode, currency, code);
  }

  @UseGuards(JwtAuthGuard, RolesGuard) @Get('subscriptions/current') current(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: OrganizationQueryDto,
  ) {
    return this.billing.current(user.id, query.organizationId);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('subscriptions/use-free-plan')
  async free(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: OrganizationQueryDto,
  ) {
    await this.organizations.findOwnedById(user.id, body.organizationId);
    const plan = await this.prisma.plan.findUniqueOrThrow({
      where: { code: 'free' },
    });
    return this.prisma.subscription.upsert({
      create: {
        billingMode: 'ONE_TIME',
        currencyCode: 'IDR',
        organizationId: body.organizationId,
        planId: plan.id,
        status: 'FREE',
      },
      update: { planId: plan.id, status: 'FREE' },
      where: { organizationId: body.organizationId },
    });
  }
  @UseGuards(JwtAuthGuard, RolesGuard) @Get('payments') payments(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: OrganizationQueryDto,
  ) {
    return this.billing.listPayments(user.id, query.organizationId);
  }
  @UseGuards(JwtAuthGuard, RolesGuard) @Get('payments/:id') payment(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.billing.payment(user.id, id);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('subscriptions/cancel')
  async cancelSubscription(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: OrganizationQueryDto,
  ) {
    await this.organizations.findOwnedById(user.id, dto.organizationId);
    const subscription = await this.prisma.subscription.findUniqueOrThrow({
      where: { organizationId: dto.organizationId },
    });
    if (
      subscription.recurringProvider === 'PAYPAL' &&
      subscription.externalSubscriptionId
    )
      await this.providers.paypal(
        `/v1/billing/subscriptions/${subscription.externalSubscriptionId}/cancel`,
        'POST',
        { reason: 'Canceled by customer' },
      );
    if (subscription.recurringProvider === 'MIDTRANS')
      throw new BadRequestException(
        'Midtrans recurring cancellation is unavailable for the configured channel.',
      );
    await this.prisma.recurringSubscription.updateMany({
      data: { canceledAt: new Date(), status: 'CANCELED' },
      where: {
        organizationId: dto.organizationId,
        status: { not: 'CANCELED' },
      },
    });
    return this.prisma.subscription.update({
      data: { cancelAtPeriodEnd: true, status: 'CANCELED' },
      where: { organizationId: dto.organizationId },
    });
  }
  @UseGuards(JwtAuthGuard, RolesGuard) @Get('invoices') invoices(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: OrganizationQueryDto,
  ) {
    return this.billing.listInvoices(user.id, query.organizationId);
  }
  @UseGuards(JwtAuthGuard, RolesGuard) @Get('invoices/:id') invoice(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.billing.invoice(user.id, id);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('invoices/:id/json')
  async invoiceJson(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    res
      .attachment(`invoice-${id}.json`)
      .json(await this.billing.invoice(user.id, id));
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('invoices/:id/pdf')
  async invoicePdf(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const invoice = await this.billing.invoice(user.id, id);
    const html = invoiceHtml(invoice);
    res
      .type('application/pdf')
      .attachment(`${invoice.invoiceNumber}.pdf`)
      .send(await this.pdf.render(html));
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('enterprise/requests')
  async enterprise(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: EnterpriseRequestDto,
  ) {
    await this.organizations.findOwnedById(user.id, dto.organizationId);
    return this.prisma.enterprisePlanRequest.create({
      data: { ...dto, requesterUserId: user.id },
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('payments/midtrans/create')
  async midtrans(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CheckoutDto,
  ) {
    await this.organizations.findOwnedById(user.id, dto.organizationId);
    if (dto.currencyCode !== 'IDR')
      throw new UnauthorizedException(
        'Midtrans checkout currently supports IDR only. Please choose IDR or use PayPal.',
      );
    const quote = await this.billing.quote(
      dto.planCode,
      dto.currencyCode,
      dto.couponCode,
    );
    const payment = await this.prisma.payment.create({
      data: this.billing.paymentData(
        dto.organizationId,
        PaymentProvider.MIDTRANS,
        BillingMode.ONE_TIME,
        quote,
      ),
    });
    const result = await this.providers.midtrans(
      payment.id,
      payment.totalAmount,
    );
    return this.prisma.payment.update({
      data: {
        checkoutUrl: result.redirect_url,
        externalOrderId: payment.id,
        snapToken: result.token,
      },
      where: { id: payment.id },
    });
  }
  @Post('payments/midtrans/notification') async midtransNotification(
    @Body() payload: Record<string, string>,
  ) {
    this.providers.verifyMidtrans(payload);
    if (!payload.order_id)
      throw new BadRequestException('Missing Midtrans order id');
    const payment = await this.prisma.payment.findFirst({
      where: { id: payload.order_id, provider: PaymentProvider.MIDTRANS },
    });
    if (!payment) throw new BadRequestException('Unknown Midtrans order');
    if (
      !payload.gross_amount ||
      !Number.isFinite(Number(payload.gross_amount)) ||
      Math.round(Number(payload.gross_amount)) !== payment.totalAmount
    )
      throw new BadRequestException('Midtrans amount does not match');
    if (payload.currency && payload.currency !== payment.currencyCode)
      throw new BadRequestException('Midtrans currency does not match');
    if (['capture', 'settlement'].includes(payload.transaction_status ?? ''))
      return this.billing.activatePaid(payment.id, payload.transaction_id);
    return { status: 'ignored' };
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('payments/midtrans/recurring/create')
  async midtransRecurring(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CheckoutDto,
  ) {
    if (dto.currencyCode !== 'IDR')
      throw new UnauthorizedException(
        'Midtrans recurring currently supports IDR only.',
      );
    await this.organizations.findOwnedById(user.id, dto.organizationId);
    throw new UnauthorizedException(
      'Midtrans recurring is unavailable for the configured sandbox channel.',
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('payments/paypal/create-order')
  async paypalOrder(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CheckoutDto,
  ) {
    await this.organizations.findOwnedById(user.id, dto.organizationId);
    if (!['USD', 'EUR', 'SGD'].includes(dto.currencyCode))
      throw new UnauthorizedException(
        'PayPal checkout is not available for IDR. Please choose USD, EUR, SGD, or use Midtrans.',
      );
    const quote = await this.billing.quote(
      dto.planCode,
      dto.currencyCode,
      dto.couponCode,
    );
    const payment = await this.prisma.payment.create({
      data: this.billing.paymentData(
        dto.organizationId,
        PaymentProvider.PAYPAL,
        BillingMode.ONE_TIME,
        quote,
      ),
    });
    const order = (await this.providers.paypal('/v2/checkout/orders', 'POST', {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: dto.currencyCode,
            value: formatProviderAmount(payment.totalAmount),
          },
          custom_id: payment.id,
        },
      ],
      application_context: {
        cancel_url: this.config.get('PAYMENT_ERROR_URL'),
        return_url: this.config.get('PAYMENT_SUCCESS_URL'),
      },
    })) as { id: string; links: { href: string; rel: string }[] };
    return this.prisma.payment.update({
      data: {
        checkoutUrl: order.links.find((l) => l.rel === 'approve')?.href,
        externalOrderId: order.id,
      },
      where: { id: payment.id },
    });
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('payments/paypal/capture-order')
  async capture(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CapturePayPalDto,
  ) {
    const payment = await this.prisma.payment.findUniqueOrThrow({
      where: { externalOrderId: dto.orderId },
    });
    await this.organizations.findOwnedById(user.id, payment.organizationId);
    const result = (await this.providers.paypal(
      `/v2/checkout/orders/${dto.orderId}/capture`,
      'POST',
      {},
    )) as { status: string; id: string };
    if (result.status === 'COMPLETED')
      return this.billing.activatePaid(payment.id, result.id);
    return payment;
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('payments/paypal/subscriptions/create')
  async paypalSubscription(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CheckoutDto,
  ) {
    await this.organizations.findOwnedById(user.id, dto.organizationId);
    if (!['USD', 'EUR', 'SGD'].includes(dto.currencyCode))
      throw new UnauthorizedException(
        'PayPal recurring is not available for IDR.',
      );
    const quote = await this.billing.quote(
      dto.planCode,
      dto.currencyCode,
      dto.couponCode,
    );
    if (!quote.plan.enableRecurring)
      throw new UnauthorizedException(
        'Recurring billing is not available for this plan.',
      );
    const product = (await this.providers.paypal(
      '/v1/catalogs/products',
      'POST',
      { name: `Kodeye ${quote.plan.name}`, type: 'SERVICE' },
    )) as { id: string };
    const plan = (await this.providers.paypal('/v1/billing/plans', 'POST', {
      billing_cycles: [
        {
          frequency: { interval_count: 1, interval_unit: 'MONTH' },
          pricing_scheme: {
            fixed_price: {
              currency_code: dto.currencyCode,
              value: formatProviderAmount(quote.totalAmount),
            },
          },
          sequence: 1,
          tenure_type: 'REGULAR',
          total_cycles: 0,
        },
      ],
      name: `Kodeye ${quote.plan.name} ${dto.currencyCode}`,
      payment_preferences: { auto_bill_outstanding: true },
      product_id: product.id,
    })) as { id: string };
    const remote = (await this.providers.paypal(
      '/v1/billing/subscriptions',
      'POST',
      {
        application_context: {
          cancel_url: this.config.get('PAYMENT_ERROR_URL'),
          return_url: this.config.get('PAYMENT_SUCCESS_URL'),
        },
        custom_id: dto.organizationId,
        plan_id: plan.id,
      },
    )) as { id: string; links: { href: string; rel: string }[] };
    const local = await this.prisma.subscription.upsert({
      create: {
        billingMode: 'RECURRING',
        currencyCode: dto.currencyCode,
        externalSubscriptionId: remote.id,
        organizationId: dto.organizationId,
        planId: quote.plan.id,
        recurringProvider: 'PAYPAL',
        status: 'INCOMPLETE',
      },
      update: {
        billingMode: 'RECURRING',
        currencyCode: dto.currencyCode,
        externalSubscriptionId: remote.id,
        planId: quote.plan.id,
        recurringProvider: 'PAYPAL',
        status: 'INCOMPLETE',
      },
      where: { organizationId: dto.organizationId },
    });
    await this.prisma.recurringSubscription.create({
      data: {
        currencyCode: dto.currencyCode,
        externalPlanId: plan.id,
        externalProductId: product.id,
        externalSubscriptionId: remote.id,
        organizationId: dto.organizationId,
        provider: 'PAYPAL',
        status: 'PENDING',
        subscriptionId: local.id,
      },
    });
    return {
      approvalUrl: remote.links.find((link) => link.rel === 'approve')?.href,
      subscriptionId: remote.id,
    };
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('payments/paypal/subscriptions/verify')
  async verifyPaypalSubscription(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: VerifySubscriptionDto,
  ) {
    await this.organizations.findOwnedById(user.id, dto.organizationId);
    const local = await this.prisma.recurringSubscription.findFirst({
      where: {
        externalSubscriptionId: dto.subscriptionId,
        organizationId: dto.organizationId,
      },
    });
    if (!local)
      throw new BadRequestException('PayPal subscription was not found');
    const remote = (await this.providers.paypal(
      `/v1/billing/subscriptions/${dto.subscriptionId}`,
    )) as { status: string };
    if (remote.status === 'ACTIVE') {
      await this.prisma.subscription.update({
        data: { status: 'ACTIVE' },
        where: { organizationId: dto.organizationId },
      });
      await this.prisma.recurringSubscription.update({
        data: { startedAt: new Date(), status: 'ACTIVE' },
        where: { externalSubscriptionId: dto.subscriptionId },
      });
    }
    return remote;
  }
  @Post('payments/paypal/webhook') async paypalWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('paypal-auth-algo') authAlgo?: string,
    @Headers('paypal-cert-url') certUrl?: string,
    @Headers('paypal-transmission-id') transmissionId?: string,
    @Headers('paypal-transmission-sig') transmissionSig?: string,
    @Headers('paypal-transmission-time') transmissionTime?: string,
  ) {
    if (!req.rawBody) throw new UnauthorizedException('Invalid PayPal webhook');
    const event = JSON.parse(req.rawBody.toString()) as {
      event_type?: string;
      id?: string;
      resource?: { id?: string; status?: string };
    };
    await this.providers.verifyPayPalWebhook(
      {
        authAlgo,
        certUrl,
        transmissionId,
        transmissionSig,
        transmissionTime,
      },
      event,
    );
    if (!event.id) throw new BadRequestException('Missing PayPal event id');
    const existing = await this.prisma.paymentWebhookEvent.findUnique({
      where: {
        provider_eventId: { eventId: event.id, provider: 'PAYPAL' },
      },
    });
    if (existing) return { status: 'already-processed' };
    await this.prisma.paymentWebhookEvent.create({
      data: {
        eventId: event.id,
        eventType: event.event_type,
        externalSubscriptionId: event.resource?.id,
        payloadJson: event as Prisma.InputJsonValue,
        processedAt: new Date(),
        provider: 'PAYPAL',
        status: 'VERIFIED',
      },
    });
    const status = paypalRecurringStatus(event.event_type);
    if (status && event.resource?.id) {
      await this.prisma.recurringSubscription.updateMany({
        data: {
          canceledAt: status === 'CANCELED' ? new Date() : undefined,
          startedAt: status === 'ACTIVE' ? new Date() : undefined,
          status,
        },
        where: { externalSubscriptionId: event.resource.id },
      });
      await this.prisma.subscription.updateMany({
        data: {
          status:
            status === 'ACTIVE'
              ? 'ACTIVE'
              : status === 'SUSPENDED'
                ? 'SUSPENDED'
                : status === 'CANCELED'
                  ? 'CANCELED'
                  : undefined,
        },
        where: { externalSubscriptionId: event.resource.id },
      });
    }
    return { status: 'accepted' };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('admin/exchange-rates/refresh')
  refresh() {
    return Promise.all(
      ['USD', 'EUR', 'SGD'].map((c) => this.fx.refreshRate('IDR', c)),
    );
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/coupons')
  adminCoupons() {
    return this.prisma.coupon.findMany({ include: { amounts: true } });
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('admin/coupons')
  adminCoupon(@Body() dto: CouponDto) {
    return this.prisma.coupon.create({
      data: {
        ...dto,
        code: dto.code.toUpperCase(),
        percentOff:
          dto.percentOff === undefined
            ? undefined
            : new Prisma.Decimal(dto.percentOff),
      },
    });
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/plans')
  adminPlans() {
    return this.prisma.plan.findMany({
      include: { prices: { orderBy: { currencyCode: 'asc' } } },
      orderBy: { createdAt: 'asc' },
    });
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('admin/plans/:id')
  updatePlan(@Param('id') id: string, @Body() dto: UpdatePlanDto) {
    return this.prisma.plan.update({ data: dto, where: { id } });
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('admin/plans/:id/prices')
  price(@Param('id') planId: string, @Body() dto: PlanPriceDto) {
    return this.prisma.planPrice.upsert({
      create: { ...dto, planId },
      update: { amount: dto.amount, isActive: true },
      where: {
        planId_currencyCode: { planId, currencyCode: dto.currencyCode },
      },
    });
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/enterprise/requests')
  enterpriseList() {
    return this.prisma.enterprisePlanRequest.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}

function formatProviderAmount(amount: number) {
  return (amount / 100).toFixed(2);
}
function paypalRecurringStatus(eventType?: string) {
  if (eventType === 'BILLING.SUBSCRIPTION.ACTIVATED') return 'ACTIVE' as const;
  if (eventType === 'BILLING.SUBSCRIPTION.CANCELLED')
    return 'CANCELED' as const;
  if (eventType === 'BILLING.SUBSCRIPTION.SUSPENDED')
    return 'SUSPENDED' as const;
  return null;
}
function invoiceHtml(i: Awaited<ReturnType<BillingService['invoice']>>) {
  const e = (v: unknown) =>
    String(v ?? '').replace(
      /[&<>"']/g,
      (c) =>
        ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;',
        })[c]!,
    );
  return `<!doctype html><html><style>body{font:14px Arial;color:#334155;padding:32px}h1{color:#4f46e5}table{width:100%;border-collapse:collapse}td{padding:8px;border-bottom:1px solid #ddd}.total{font-size:20px;font-weight:bold}</style><h1>Kodeye Invoice</h1><p>${e(i.invoiceNumber)} | ${e(i.organization.name)}</p><table><tr><td>Currency</td><td>${e(i.currencyCode)}</td></tr><tr><td>Subtotal</td><td>${i.subtotalAmount}</td></tr><tr><td>Discount</td><td>${i.discountAmount}</td></tr><tr><td>${e(i.taxLabel)} Tax</td><td>${i.taxAmount}</td></tr><tr class="total"><td>Total</td><td>${i.totalAmount}</td></tr></table><p>Tax calculation is configurable and should be reviewed by finance/legal before production.</p></html>`;
}
