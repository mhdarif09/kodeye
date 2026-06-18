import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateSalesInquiryDto {
  @IsString()
  @Matches(/\S/, { message: 'name must contain a non-whitespace character' })
  @MaxLength(255)
  name!: string;

  @IsEmail()
  @MaxLength(255)
  email!: string;

  @IsString()
  @Matches(/\S/, {
    message: 'companyName must contain a non-whitespace character',
  })
  @MaxLength(255)
  companyName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  phone?: string;

  @IsString()
  @IsIn([
    'ai-automation',
    'engineering-consulting',
    'devops-infrastructure',
    'website-development',
    'audit-platform',
    'not-sure',
  ])
  service!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  budget?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  timeline?: string;

  @IsString()
  @MinLength(20)
  @MaxLength(4000)
  message!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  source?: string;
}
