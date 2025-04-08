import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class UserModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;
}
