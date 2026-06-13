import { IsBooleanString, IsOptional } from 'class-validator';

export class ReportQueryDto {
  @IsOptional()
  @IsBooleanString()
  refresh?: string;
}
