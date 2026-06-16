import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuditAction, Prisma, UserRole, UserStatus } from '@prisma/client';
import { randomBytes } from 'node:crypto';

import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import type { AdminUsersQueryDto } from '../dto/admin-users-query.dto';

const adminUserSelect = {
  _count: {
    select: {
      memberships: true,
      ownedOrganizations: true,
      triggeredScanJobs: true,
    },
  },
  createdAt: true,
  deletedAt: true,
  email: true,
  id: true,
  name: true,
  role: true,
  status: true,
  suspendedAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class AdminUsersService {
  constructor(private readonly prisma: PrismaService) {}

  list(query: AdminUsersQueryDto) {
    const where: Prisma.UserWhereInput = {
      role: query.role,
      status: query.status,
    };
    const search = query.search?.trim();
    if (search) {
      where.OR = [
        { email: { contains: search } },
        { name: { contains: search } },
        { id: { contains: search } },
      ];
    }
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: adminUserSelect,
      take: 100,
      where,
    });
  }

  async updateRole(actorUserId: string, userId: string, role: UserRole) {
    if (actorUserId === userId) {
      throw new BadRequestException('Admins cannot change their own role');
    }
    await this.assertUserExists(userId);
    if (role !== UserRole.ADMIN) {
      await this.assertAnotherActiveAdmin(userId);
    }
    const user = await this.prisma.user.update({
      data: { role },
      select: adminUserSelect,
      where: { id: userId },
    });
    await this.audit(actorUserId, AuditAction.UPDATE, user, { role });
    return user;
  }

  async suspend(actorUserId: string, userId: string) {
    if (actorUserId === userId) {
      throw new BadRequestException('Admins cannot suspend themselves');
    }
    await this.assertUserExists(userId);
    await this.assertAnotherActiveAdmin(userId);
    const user = await this.prisma.user.update({
      data: { status: UserStatus.SUSPENDED, suspendedAt: new Date() },
      select: adminUserSelect,
      where: { id: userId },
    });
    await this.audit(actorUserId, AuditAction.UPDATE, user, {
      status: UserStatus.SUSPENDED,
    });
    return user;
  }

  async reactivate(actorUserId: string, userId: string) {
    const existing = await this.assertUserExists(userId);
    if (existing.status === UserStatus.DELETED) {
      throw new BadRequestException('Deleted users cannot be reactivated');
    }
    const user = await this.prisma.user.update({
      data: { status: UserStatus.ACTIVE, suspendedAt: null },
      select: adminUserSelect,
      where: { id: userId },
    });
    await this.audit(actorUserId, AuditAction.UPDATE, user, {
      status: UserStatus.ACTIVE,
    });
    return user;
  }

  async delete(actorUserId: string, userId: string) {
    if (actorUserId === userId) {
      throw new BadRequestException('Admins cannot delete themselves');
    }
    await this.assertUserExists(userId);
    await this.assertAnotherActiveAdmin(userId);
    const user = await this.prisma.user.update({
      data: {
        deletedAt: new Date(),
        email: `deleted+${userId}@deleted.kodeye.local`,
        name: 'Deleted User',
        passwordHash: randomBytes(48).toString('hex'),
        status: UserStatus.DELETED,
        suspendedAt: null,
      },
      select: adminUserSelect,
      where: { id: userId },
    });
    await this.audit(actorUserId, AuditAction.DELETE, user, {
      softDelete: true,
    });
    return user;
  }

  private async assertUserExists(userId: string) {
    const user = await this.prisma.user.findUnique({
      select: { id: true, role: true, status: true },
      where: { id: userId },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  private async assertAnotherActiveAdmin(userId: string) {
    const target = await this.prisma.user.findUnique({
      select: { role: true, status: true },
      where: { id: userId },
    });
    if (
      target?.role !== UserRole.ADMIN ||
      target.status !== UserStatus.ACTIVE
    ) {
      return;
    }
    const activeAdmins = await this.prisma.user.count({
      where: {
        id: { not: userId },
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
      },
    });
    if (activeAdmins === 0) {
      throw new BadRequestException('Cannot remove the last active admin');
    }
  }

  private audit(
    actorUserId: string,
    action: AuditAction,
    user: { email: string; id: string; status: UserStatus },
    metadataJson: Prisma.InputJsonValue,
  ) {
    return this.prisma.adminAuditLog.create({
      data: {
        action,
        actorUserId,
        metadataJson,
        resourceId: user.id,
        resourceKey: user.email,
        resourceType: 'user',
      },
    });
  }
}
