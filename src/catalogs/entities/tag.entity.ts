import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true, nullable: false, length: 100 })
  name!: string;

  @Column({ unique: true, nullable: false, length: 100 })
  slug!: string;
}
