import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ReviewFindingDto {
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  question?: string;
}
