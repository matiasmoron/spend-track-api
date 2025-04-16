import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ExpenseModel } from './ExpenseModel';

@Entity('expense_participants')
export class ExpenseParticipantModel {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'expense_id' })
  expenseId!: number;

  @ManyToOne(() => ExpenseModel)
  @JoinColumn({ name: 'expense_id' })
  expense!: ExpenseModel;

  @Column({ name: 'user_id' })
  userId!: number;

  /**
   * The amount can be positive or negative:
   * - Positive: amount paid by the user.
   * - Negative: amount owed by the user.
   *
   * A single user may have two entries in the same expense:
   * one for the amount they paid, and another for the amount they owe.
   * This allows flexible tracking of overpayments and debt within the group.
   */
  @Column('decimal', { precision: 10, scale: 2 })
  amount!: number;
}
