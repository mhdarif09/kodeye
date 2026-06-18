import { SalesInquiryStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateSalesInquiryDto {
  @IsOptional()
  @IsEnum(SalesInquiryStatus)
  status?: SalesInquiryStatus;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  adminNote?: string;
}
