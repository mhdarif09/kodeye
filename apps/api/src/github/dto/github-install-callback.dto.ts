import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GitHubInstallCallbackDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsString()
  @IsNotEmpty()
  installation_id!: string;

  @IsString()
  @IsNotEmpty()
  setup_action!: string;

  @IsOptional()
  @IsString()
  state?: string;
}
