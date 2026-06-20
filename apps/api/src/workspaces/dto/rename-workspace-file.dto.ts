import { IsString, MaxLength } from 'class-validator';

export class RenameWorkspaceFileDto {
  @IsString()
  @MaxLength(2048)
  fromPath!: string;

  @IsString()
  @MaxLength(2048)
  toPath!: string;
}
