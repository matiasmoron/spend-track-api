import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Currency } from '../../../domain/value-objects';
import { GroupModel } from './GroupModel';

@Entity('expenses')
export class ExpenseModel {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'group_id' })
  groupId!: number;

  @ManyToOne(() => GroupModel)
  @JoinColumn({ name: 'group_id' })
  group!: GroupModel;

  @Column()
  description!: string;

  @Column('decimal', { precision: 10, scale: 2 })
  total!: number;

  @Column({ type: 'enum', enum: Currency })
  currency!: Currency;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
