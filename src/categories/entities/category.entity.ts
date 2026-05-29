import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsString,
  MinLength,
} from 'class-validator';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

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

  @Column({ nullable: true })
  @IsString()
  descsiptrion?: string;

  @Column({ nullable: true })
  @IsString()
  image?: string;

  @Column({ nullable: true, type: 'bigint' })
  @IsNumber()
  parent_id?: string;

  @Column({ nullable: true, name: 'is_active', default: true })
  @IsBoolean()
  isActive?: string;

  @Column({ nullable: true, type: 'bigint', name: 'created_by' })
  @IsNumber()
  createdBy?: string;

  @Column({ nullable: true, type: 'bigint', name: 'updated_by' })
  @IsNumber()
  updatedBy?: string;

  @Column({
    nullable: true,
    name: 'created_at',
    type: 'timestamp',
    default: 'CURRENT_TIMESTAMP',
  })
  @IsDate()
  createdAt?: Date;

  @Column({
    nullable: true,
    name: 'updated_at',
    type: 'timestamp',
    default: 'CURRENT_TIMESTAMP',
  })
  @IsDate()
  updatedAt?: Date;

  //SELF RELATION
  @ManyToOne(() => Category, (category) => category.children, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'parent_id' })
  parent?: Category;

  @OneToMany(() => Category, (category) => category.parent)
  children?: Category[];

  // USER RELATION
  @ManyToOne(() => User, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'created_by' })
  createdUser?: User;

  @ManyToOne(() => User, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'updated_by' })
  updatedUser?: User;
}
