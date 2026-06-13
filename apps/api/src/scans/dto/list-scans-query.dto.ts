import { ScanStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class ListScansQueryDto {
  @IsOptional()
  @IsString()
  organizationId?: string;

  @IsOptional()
  @IsString()
  repositoryId?: string;

  @IsOptional()
  @IsEnum(ScanStatus)
  status?: ScanStatus;
}
