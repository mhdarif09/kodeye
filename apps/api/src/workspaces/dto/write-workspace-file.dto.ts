import { IsString, MaxLength } from 'class-validator';

export class WriteWorkspaceFileDto {
  @IsString()
  @MaxLength(2048)
  path!: string;

  @IsString()
  content!: string;
}
