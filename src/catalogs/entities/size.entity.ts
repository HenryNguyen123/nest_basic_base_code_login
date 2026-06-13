import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('sizes')
export class Size {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true, nullable: false, length: 50 })
  name!: string;

  @Column({ unique: true, nullable: false, length: 50 })
  code!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
