import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SyncGitHubRepositoriesDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  organizationId!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  installationId!: string;
}
