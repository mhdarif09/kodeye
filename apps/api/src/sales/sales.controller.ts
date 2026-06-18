import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';

import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateSalesInquiryDto } from './dto/create-sales-inquiry.dto';
import { SalesInquiriesQueryDto } from './dto/sales-inquiries-query.dto';
import { UpdateSalesInquiryDto } from './dto/update-sales-inquiry.dto';
import { SalesService } from './sales.service';

@Controller()
export class SalesController {
  constructor(private readonly sales: SalesService) {}

  @Post('sales/inquiries')
  createInquiry(@Body() dto: CreateSalesInquiryDto) {
    return this.sales.createInquiry(dto);
  }

  @Get('admin/sales-inquiries')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  listInquiries(@Query() query: SalesInquiriesQueryDto) {
    return this.sales.listInquiries(query.status);
  }

  @Patch('admin/sales-inquiries/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateInquiry(@Param('id') id: string, @Body() dto: UpdateSalesInquiryDto) {
    return this.sales.updateInquiry(id, dto);
  }
}
