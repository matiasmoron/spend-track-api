import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
} from 'class-validator';
import { Currency } from '../../../domain/value-objects';

export class UpdatePaymentDTO {
  @IsNotEmpty({ message: 'Payment ID is required' })
  @IsInt({ message: 'Payment ID must be an integer' })
  paymentId!: number;

  @IsNotEmpty({ message: 'From user ID is required' })
  @IsInt({ message: 'From user ID must be an integer' })
  fromUserId!: number;

  @IsNotEmpty({ message: 'To user ID is required' })
  @IsInt({ message: 'To user ID must be an integer' })
  toUserId!: number;

  @IsNotEmpty({ message: 'Amount is required' })
  @IsNumber({}, { message: 'Amount must be a number' })
  @IsPositive({ message: 'Amount must be greater than 0' })
  amount!: number;

  @IsNotEmpty({ message: 'Currency is required' })
  @IsEnum(Currency, { message: 'Currency must be USD or ARS' })
  currency!: Currency;

  @IsNotEmpty({ message: 'Title is required' })
  @IsString()
  @MinLength(2, { message: 'Title must be at least 2 characters' })
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDate({ message: 'CreatedAt must be a valid date' })
  @Type(() => Date)
  createdAt?: Date;
}
