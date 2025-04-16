export interface ExpenseParticipantProps {
  expenseId: number;
  userId: number;
  amount: number;
}

export class ExpenseParticipant {
  readonly expenseId: number;
  readonly userId: number;
  readonly amount: number;

  constructor(props: ExpenseParticipantProps) {
    this.expenseId = props.expenseId;
    this.userId = props.userId;
    this.amount = props.amount;
  }
}
