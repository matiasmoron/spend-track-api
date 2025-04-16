import { Currency } from '../../value-objects';

export interface ExpenseProps {
  id: number;
  groupId: number;
  description: string;
  total: number;
  currency: Currency;
  createdAt: Date;
  updatedAt?: Date;
}

export class Expense {
  readonly id: number;
  readonly groupId: number;
  readonly description: string;
  readonly total: number;
  readonly currency: Currency;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: ExpenseProps) {
    this.id = props.id;
    this.groupId = props.groupId;
    this.description = props.description;
    this.total = props.total;
    this.currency = props.currency;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
