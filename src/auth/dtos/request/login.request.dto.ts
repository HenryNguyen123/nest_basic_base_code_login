import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @IsString()
  @MinLength(3)
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  email: string;

  @MinLength(6)
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.trim())
  password: string;
}
