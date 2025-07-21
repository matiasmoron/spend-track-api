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

export class ParticipantInputDTO {
  @IsNotEmpty({ message: 'User ID is required' })
  @IsInt({ message: 'User ID must be an integer' })
  userId!: number;

  @IsNotEmpty({ message: 'Amount is required' })
  @IsNumber({}, { message: 'Amount must be a number' })
  amount!: number;
}

export class CreateExpenseDTO {
  @IsNotEmpty({ message: 'Group ID is required' })
  @IsInt({ message: 'Group ID must be an integer' })
  groupId!: number;

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
  @Type(() => ParticipantInputDTO)
  paidBy!: ParticipantInputDTO[];

  @ArrayNotEmpty({ message: 'Splits must have at least one entry' })
  @ValidateNested({ each: true })
  @Type(() => ParticipantInputDTO)
  splits!: ParticipantInputDTO[];

  @IsOptional()
  @IsDate({ message: 'CreatedAt must be a valid date' })
  @Type(() => Date)
  createdAt?: Date;
}
