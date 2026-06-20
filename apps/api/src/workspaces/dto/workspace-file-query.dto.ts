import { IsOptional, IsString, MaxLength } from 'class-validator';

export class WorkspaceFileQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  path?: string;
}
