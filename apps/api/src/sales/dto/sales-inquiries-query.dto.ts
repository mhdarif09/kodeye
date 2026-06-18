import { SalesInquiryStatus } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class SalesInquiriesQueryDto {
  @IsOptional()
  @IsEnum(SalesInquiryStatus)
  status?: SalesInquiryStatus;
}
