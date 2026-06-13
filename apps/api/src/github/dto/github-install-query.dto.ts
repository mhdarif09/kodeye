import { IsNotEmpty, IsString } from 'class-validator';

export class GitHubInstallQueryDto {
  @IsString()
  @IsNotEmpty()
  organizationId!: string;
}
