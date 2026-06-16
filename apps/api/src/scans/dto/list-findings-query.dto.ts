import { FindingSeverity, FindingStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class ListFindingsQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  search?: string;

  @IsOptional()
  @IsEnum(FindingSeverity)
  severity?: FindingSeverity;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  scanner?: string;

  @IsOptional()
  @IsEnum(FindingStatus)
  status?: FindingStatus;
}
