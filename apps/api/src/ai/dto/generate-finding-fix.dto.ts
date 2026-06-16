import { IsOptional, IsString, MaxLength } from 'class-validator';

export class GenerateFindingFixDto {
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  instruction?: string;
}
