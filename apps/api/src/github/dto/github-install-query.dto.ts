import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GitHubInstallQueryDto {
  @IsString()
  @IsNotEmpty()
  organizationId!: string;

  @IsOptional()
  @IsIn(['github-integration', 'onboarding'])
  returnTo?: 'github-integration' | 'onboarding';
}
