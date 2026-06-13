import { FindingSeverity, FindingStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class ListFindingsQueryDto {
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
