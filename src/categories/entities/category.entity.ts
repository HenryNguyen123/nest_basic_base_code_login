import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsString,
  MinLength,
} from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ unique: false })
  @IsNotEmpty()
  @MinLength(2)
  @IsString()
  name?: string;

  @Column({ unique: true })
  @IsNotEmpty()
  @MinLength(2)
  @IsString()
  slug?: string;

  @Column({ unique: false })
  @IsString()
  descsiptrion?: string;

  @Column({ unique: false })
  @IsString()
  image?: string;

  @Column({ unique: false })
  @IsNumber()
  parent_id?: string;

  @Column({ unique: false, name: 'is_active', default: true })
  @IsBoolean()
  isActive?: string;

  @Column({ unique: false, name: 'created_by' })
  @IsNumber()
  createdBy?: string;

  @Column({ unique: false, name: 'updated_by' })
  @IsNumber()
  updatedBy?: string;

  @Column({ unique: false, name: 'created_at' })
  @IsDate()
  createdAt?: string;

  @Column({ unique: false, name: 'updated_at' })
  @IsDate()
  updatedAt?: string;
}
