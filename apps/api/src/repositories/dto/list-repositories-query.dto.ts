import { IsOptional, IsString } from 'class-validator';

export class ListRepositoriesQueryDto {
  @IsOptional()
  @IsString()
  organizationId?: string;
}
