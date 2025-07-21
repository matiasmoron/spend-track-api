import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Currency } from '../../../domain/value-objects';

export class UpdateExpenseParticipantInputDTO {
  @IsNotEmpty({ message: 'User ID is required' })
  @IsInt({ message: 'User ID must be an integer' })
  userId!: number;

  @IsNotEmpty({ message: 'Amount is required' })
  @IsNumber({}, { message: 'Amount must be a number' })
  amount!: number;
}

export class UpdateExpenseDTO {
  @IsNotEmpty({ message: 'Expense ID is required' })
  @IsInt({ message: 'Expense ID must be an integer' })
  expenseId!: number;

  @IsNotEmpty({ message: 'Description is required' })
  @IsString()
  @MinLength(2, { message: 'Description must be at least 2 characters' })
  description!: string;

  @IsNotEmpty({ message: 'Total amount is required' })
  @IsNumber()
  @IsPositive({ message: 'Total must be greater than 0' })
  total!: number;

  @IsNotEmpty({ message: 'Currency is required' })
  @IsEnum(Currency, { message: 'Currency must be USD or ARS' })
  currency!: Currency;

  @ArrayNotEmpty({ message: 'PaidBy must have at least one entry' })
  @ValidateNested({ each: true })
  @Type(() => UpdateExpenseParticipantInputDTO)
  paidBy!: UpdateExpenseParticipantInputDTO[];

  @ArrayNotEmpty({ message: 'Splits must have at least one entry' })
  @ValidateNested({ each: true })
  @Type(() => UpdateExpenseParticipantInputDTO)
  splits!: UpdateExpenseParticipantInputDTO[];

  @IsOptional()
  @IsDate({ message: 'CreatedAt must be a valid date' })
  @Type(() => Date)
  createdAt?: Date;
}
