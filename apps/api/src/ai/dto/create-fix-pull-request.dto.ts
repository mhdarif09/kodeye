import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateFixPullRequestDto {
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  approvalToken!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(500)
  commitMessage!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100_000)
  patch!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200_000)
  proposedContent!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(255)
  sourceSha!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title!: string;
}
