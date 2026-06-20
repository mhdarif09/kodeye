import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateWorkspaceFileDto {
  @IsString()
  @MaxLength(2048)
  path!: string;

  @IsOptional()
  @IsString()
  content?: string;
}
