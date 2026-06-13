import { IsOptional, IsString } from 'class-validator';

export class GitHubRepositoriesQueryDto {
  @IsOptional()
  @IsString()
  organizationId?: string;
}
