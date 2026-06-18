import { Injectable } from '@nestjs/common';
import { SalesInquiryStatus } from '@prisma/client';

import { PrismaService } from '../infrastructure/prisma/prisma.service';
import { CreateSalesInquiryDto } from './dto/create-sales-inquiry.dto';
import { UpdateSalesInquiryDto } from './dto/update-sales-inquiry.dto';

@Injectable()
export class SalesService {
  constructor(private readonly prisma: PrismaService) {}

  createInquiry(dto: CreateSalesInquiryDto) {
    return this.prisma.salesInquiry.create({
      data: {
        budget: dto.budget?.trim() || null,
        companyName: dto.companyName.trim(),
        email: dto.email.trim().toLowerCase(),
        message: dto.message.trim(),
        name: dto.name.trim(),
        phone: dto.phone?.trim() || null,
        service: dto.service,
        source: dto.source?.trim() || 'contact-sales',
        timeline: dto.timeline?.trim() || null,
      },
    });
  }

  listInquiries(status?: SalesInquiryStatus) {
    return this.prisma.salesInquiry.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      where: status ? { status } : undefined,
    });
  }

  updateInquiry(id: string, dto: UpdateSalesInquiryDto) {
    const contactedAt =
      dto.status === SalesInquiryStatus.CONTACTED ? new Date() : undefined;

    return this.prisma.salesInquiry.update({
      data: {
        adminNote: dto.adminNote,
        contactedAt,
        status: dto.status,
      },
      where: { id },
    });
  }
}
