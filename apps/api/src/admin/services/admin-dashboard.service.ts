import { Injectable } from '@nestjs/common';
import { PaymentStatus, SubscriptionStatus } from '@prisma/client';

import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { AppSettingsService } from '../../settings/app-settings.service';

@Injectable()
export class AdminDashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly settings: AppSettingsService,
  ) {}

  async summary() {
    const [
      totalUsers,
      totalOrganizations,
      totalRepositories,
      totalScanJobs,
      totalFindings,
      activeSubscriptions,
      recentPayments,
      recentScans,
      recentAuditLogs,
      paidAggregate,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.organization.count(),
      this.prisma.repository.count(),
      this.prisma.scanJob.count(),
      this.prisma.finding.count(),
      this.prisma.subscription.count({
        where: { status: SubscriptionStatus.ACTIVE },
      }),
      this.prisma.payment.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
          createdAt: true,
          currencyCode: true,
          id: true,
          provider: true,
          status: true,
          totalAmount: true,
        },
        take: 5,
      }),
      this.prisma.scanJob.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
          createdAt: true,
          id: true,
          repository: { select: { name: true } },
          status: true,
          totalFindings: true,
        },
        take: 5,
      }),
      this.prisma.adminAuditLog.findMany({
        include: { actor: { select: { email: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      this.prisma.payment.aggregate({
        _sum: { totalAmount: true },
        where: { currencyCode: 'IDR', status: PaymentStatus.PAID },
      }),
    ]);

    const configured = (keys: string[]) =>
      keys.every((key) => Boolean(this.settings.getString(key)));

    return {
      activeSubscriptions,
      monthlyRevenue: {
        currencyCode: 'IDR',
        totalAmount: paidAggregate._sum.totalAmount ?? 0,
      },
      providerStatus: {
        currency: configured(['BILLING_USE_LIVE_CURRENCY']),
        github: configured([
          'GITHUB_OAUTH_CLIENT_ID',
          'GITHUB_OAUTH_CLIENT_SECRET',
          'GITHUB_APP_ID',
          'GITHUB_APP_PRIVATE_KEY_PATH',
          'GITHUB_APP_WEBHOOK_SECRET',
        ]),
        midtrans: configured(['MIDTRANS_SERVER_KEY', 'MIDTRANS_CLIENT_KEY']),
        paypal: configured([
          'PAYPAL_CLIENT_ID',
          'PAYPAL_CLIENT_SECRET',
          'PAYPAL_ENVIRONMENT',
        ]),
      },
      recentAuditLogs,
      recentPayments,
      recentScans,
      totalFindings,
      totalOrganizations,
      totalRepositories,
      totalScanJobs,
      totalUsers,
    };
  }
}
