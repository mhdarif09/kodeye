import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OrganizationRole, Prisma, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../infrastructure/prisma/prisma.service';
import { publicUserSelect } from '../users/user.select';
import type { LoginDto } from './dto/login.dto';
import type { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  private readonly passwordSaltRounds = 12;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const normalizedEmail = dto.email.trim().toLowerCase();
    const passwordHash = await bcrypt.hash(
      dto.password,
      this.passwordSaltRounds,
    );

    try {
      const user = await this.prisma.$transaction(async (transaction) => {
        const createdUser = await transaction.user.create({
          data: {
            email: normalizedEmail,
            name: dto.name.trim(),
            passwordHash,
            role: UserRole.USER,
          },
          select: publicUserSelect,
        });

        await transaction.organization.create({
          data: {
            name: `${createdUser.name}'s Organization`,
            ownerUserId: createdUser.id,
            members: {
              create: {
                role: OrganizationRole.OWNER,
                userId: createdUser.id,
              },
            },
          },
        });

        return createdUser;
      });

      return this.createAuthResult(user);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Email is already registered');
      }
      throw error;
    }
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.trim().toLowerCase() },
    });

    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const { passwordHash: _passwordHash, ...publicUser } = user;
    return this.createAuthResult(publicUser);
  }

  private async createAuthResult(user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  }) {
    const accessToken = await this.jwtService.signAsync({
      email: user.email,
      role: user.role,
      sub: user.id,
    });
    const [githubInstallationCount, ownedOrganization] = await Promise.all([
      this.prisma.gitHubInstallation.count({
        where: {
          organization: {
            OR: [
              { ownerUserId: user.id },
              { members: { some: { userId: user.id } } },
            ],
          },
        },
      }),
      this.prisma.organization.findFirst({
        orderBy: { createdAt: 'desc' },
        select: { id: true },
        where: { ownerUserId: user.id },
      }),
    ]);

    return {
      accessToken,
      githubInstallOrganizationId:
        githubInstallationCount === 0 ? ownedOrganization?.id : undefined,
      user,
    };
  }
}
