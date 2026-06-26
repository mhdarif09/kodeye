import { Injectable } from '@nestjs/common';

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
      totalProjects,
      totalBlogPosts,
      totalSalesInquiries,
      recentInquiries,
      recentAuditLogs,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.portfolioProject.count(),
      this.prisma.blogPost.count(),
      this.prisma.salesInquiry.count(),
      this.prisma.salesInquiry.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      this.prisma.adminAuditLog.findMany({
        include: { actor: { select: { email: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    return {
      recentAuditLogs,
      recentInquiries,
      totalBlogPosts,
      totalProjects,
      totalSalesInquiries,
      totalUsers,
    };
  }
}
