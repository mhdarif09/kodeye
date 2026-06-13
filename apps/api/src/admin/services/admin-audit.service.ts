import { Injectable } from '@nestjs/common';
import { AuditAction, Prisma } from '@prisma/client';

import { PrismaService } from '../../infrastructure/prisma/prisma.service';

export interface AuditListQuery {
  action?: AuditAction;
  actorUserId?: string;
  resourceKey?: string;
  resourceType?: string;
  search?: string;
  take?: number;
}

@Injectable()
export class AdminAuditService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: AuditListQuery) {
    const where: Prisma.AdminAuditLogWhereInput = {
      action: query.action,
      actorUserId: query.actorUserId,
      resourceKey: query.resourceKey,
      resourceType: query.resourceType,
    };
    if (query.search) {
      where.OR = [
        { resourceKey: { contains: query.search } },
        { resourceType: { contains: query.search } },
      ];
    }
    const take = Math.min(Math.max(Number(query.take) || 50, 1), 100);
    return this.prisma.adminAuditLog.findMany({
      include: { actor: { select: { email: true, id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
      take,
      where,
    });
  }

  createTestLog(actorUserId: string, provider: string, ok: boolean) {
    return this.prisma.adminAuditLog.create({
      data: {
        action: AuditAction.TEST_CONNECTION,
        actorUserId,
        metadataJson: { ok, provider },
        resourceKey: provider,
        resourceType: 'provider',
      },
    });
  }
}
