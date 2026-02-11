import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'test@gmail.com',
    required: true,
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'john_doe',
    required: true,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  @IsNotEmpty()
  userName: string;

  @ApiProperty({
    example: 'password',
    required: true,
  })
  @IsString()
  @MinLength(6)
  @MaxLength(100)
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    example: 'John Doe',
    required: false,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  fullName?: string;

  @ApiProperty({
    example: 'male',
    required: false,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  gender?: string;

  @ApiProperty({
    example: '1990-01-01',
    required: false,
  })
  @Type(() => Date)
  @IsDate()
  dob?: string;

  @ApiProperty({
    example: '0123456789',
    required: false,
  })
  @IsString()
  @MinLength(10)
  @MaxLength(15)
  phone?: string;
}