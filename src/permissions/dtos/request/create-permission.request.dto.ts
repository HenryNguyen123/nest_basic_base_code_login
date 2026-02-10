import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreatePermissionRequestDto {
  @ApiProperty({ example: 'Create Category' })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 'CREATE_CATEGORY', required: true })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  code: string;

  @ApiProperty({ example: 'CATEGORY' })
  @IsNotEmpty()
  @IsString()
  module: string;

  @ApiProperty({ example: 'Create category permission', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  // role codes
  @ApiProperty({
    example: ['SUPER_ADMIN', 'ADMIN'],
    required: true,
  })
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  roleCodes: string[];
}
