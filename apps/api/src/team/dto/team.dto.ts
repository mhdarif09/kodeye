import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateTeamMemberDto {
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(255)
  role!: string;

  @IsString()
  @MinLength(2)
  description!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(2048)
  photoUrl!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  linkedinUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  githubUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  instagramUrl?: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateTeamMemberDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  role?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  description?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(2048)
  photoUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  linkedinUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  githubUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  instagramUrl?: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
