import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma, UserRole, UserStatus } from '@prisma/client';
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
      const user = await this.prisma.user.create({
        data: {
          email: normalizedEmail,
          name: dto.name.trim(),
          passwordHash,
          role: UserRole.ADMIN,
        },
        select: publicUserSelect,
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
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Account is not active');
    }

    const { passwordHash: _passwordHash, ...publicUser } = user;
    return this.createAuthResult(publicUser);
  }

  private async createAuthResult(user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    status?: UserStatus;
  }) {
    const accessToken = await this.jwtService.signAsync({
      email: user.email,
      role: user.role,
      sub: user.id,
    });

    return {
      accessToken,
      authSource: 'email' as const,
      user,
    };
  }
}
