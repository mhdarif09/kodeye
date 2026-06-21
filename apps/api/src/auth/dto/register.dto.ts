import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Kal' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(255)
  @Matches(/\S/, { message: 'name must contain a non-whitespace character' })
  name!: string;

  @ApiProperty({ example: 'kal@example.com' })
  @IsEmail()
  @MinLength(3)
  @MaxLength(320)
  @Matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, {
    message: 'email must be a valid email address',
  })
  email!: string;

  @ApiProperty({ example: 'StrongPassword123!', minLength: 8 })
  @IsString()
  @MinLength(8)
  @Matches(/^.{8,256}$/, { message: 'password must be at most 256 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/, {
    message:
      'password must include uppercase, lowercase, number, and symbol characters',
  })
  password!: string;
}
