import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class CreateScanDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  @Matches(/^(?!-)(?!.*\.\.)[A-Za-z0-9._/-]+$/, {
    message: 'branch contains unsupported characters',
  })
  branch?: string;
}
