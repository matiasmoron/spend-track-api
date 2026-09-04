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
import { UserModel } from './UserModel';

export const PAYMENT_CLIENT_REQUEST_ID_CONSTRAINT = 'UQ_payments_client_request_id';

@Entity('payments')
@Unique(PAYMENT_CLIENT_REQUEST_ID_CONSTRAINT, ['clientRequestId'])
export class PaymentModel {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'group_id' })
  groupId!: number;

  @ManyToOne(() => GroupModel)
  @JoinColumn({ name: 'group_id' })
  group!: GroupModel;

  @Column({ name: 'from_user_id' })
  fromUserId!: number;

  @ManyToOne(() => UserModel)
  @JoinColumn({ name: 'from_user_id' })
  fromUser!: UserModel;

  @Column({ name: 'to_user_id' })
  toUserId!: number;

  @ManyToOne(() => UserModel)
  @JoinColumn({ name: 'to_user_id' })
  toUser!: UserModel;

  @Column('decimal', { precision: 10, scale: 2 })
  amount!: number;

  @Column({ type: 'enum', enum: Currency })
  currency!: Currency;

  @Column()
  title!: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ name: 'client_request_id', type: 'uuid', nullable: true })
  clientRequestId?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
