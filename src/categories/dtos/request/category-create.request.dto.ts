import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CategoryCreateRequest {
  @ApiProperty({
    example: 'category one',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty({
    example: 'category one',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  slug!: string;

  @ApiProperty({
    example: 'description category one',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  description?: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: false,
  })
  @IsOptional()
  image?: any;

  @ApiProperty({
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  parentId?: number;

  @ApiProperty({
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
