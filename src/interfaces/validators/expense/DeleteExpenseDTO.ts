import { IsInt, IsNotEmpty } from 'class-validator';

export class DeleteExpenseDTO {
  @IsNotEmpty({ message: 'Expense ID is required' })
  @IsInt({ message: 'Expense ID must be an integer' })
  expenseId!: number;
}
