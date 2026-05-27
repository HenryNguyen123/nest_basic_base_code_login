import { IsNotEmpty, IsString, MinLength } from 'class-validator';
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
}
