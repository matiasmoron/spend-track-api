import { Currency } from '../../value-objects';

export interface PaymentProps {
  id: number;
  groupId: number;
  fromUserId: number;
  toUserId: number;
  amount: number;
  currency: Currency;
  title: string;
  description?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export class Payment {
  readonly id: number;
  readonly groupId: number;
  readonly fromUserId: number;
  readonly toUserId: number;
  readonly amount: number;
  readonly currency: Currency;
  readonly title: string;
  readonly description?: string;
  readonly createdAt: Date;
  readonly updatedAt?: Date;

  constructor(props: PaymentProps) {
    this.id = props.id;
    this.groupId = props.groupId;
    this.fromUserId = props.fromUserId;
    this.toUserId = props.toUserId;
    this.amount = props.amount;
    this.currency = props.currency;
    this.title = props.title;
    this.description = props.description;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
