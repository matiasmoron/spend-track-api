import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { Currency } from '../../../domain/value-objects';
import { GroupModel } from './GroupModel';

export const EXPENSE_CLIENT_REQUEST_ID_CONSTRAINT = 'UQ_expenses_client_request_id';

@Entity('expenses')
@Unique(EXPENSE_CLIENT_REQUEST_ID_CONSTRAINT, ['clientRequestId'])
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

  @Column({ name: 'client_request_id', type: 'uuid', nullable: true })
  clientRequestId?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
