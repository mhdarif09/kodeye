import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../infrastructure/prisma/prisma.service';
import type { UpdateProfileDto } from './dto/update-profile.dto';
import { publicUserSelect } from './user.select';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(userId: string) {
    const user = await this.prisma.user.findUnique({
      select: publicUserSelect,
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  updateProfile(userId: string, dto: UpdateProfileDto) {
    return this.prisma.user.update({
      data: { name: dto.name.trim() },
      select: publicUserSelect,
      where: { id: userId },
    });
  }
}
