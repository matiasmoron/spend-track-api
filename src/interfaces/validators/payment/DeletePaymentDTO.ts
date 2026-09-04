import { IsInt, IsNotEmpty } from 'class-validator';

export class DeletePaymentDTO {
  @IsNotEmpty({ message: 'Payment ID is required' })
  @IsInt({ message: 'Payment ID must be an integer' })
  paymentId!: number;
}
