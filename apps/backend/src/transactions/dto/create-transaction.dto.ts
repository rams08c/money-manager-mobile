import {
    IsUUID,
    IsEnum,
    IsNumber,
    IsString,
    IsOptional,
    IsDateString,
    Min,
    ValidateIf,
} from 'class-validator';
import { TransactionType } from '../enums';

export class CreateTransactionDto {
    @IsUUID('4', { message: 'Account ID must be a valid UUID' })
    accountId: string;

    @ValidateIf((o) => o.type !== TransactionType.TRANSFER)
    @IsUUID('4', { message: 'Category ID must be a valid UUID' })
    @IsOptional()
    categoryId?: string;

    @IsEnum(TransactionType, {
        message: 'Transaction type must be INCOME, EXPENSE, or TRANSFER',
    })
    type: TransactionType;

    @IsNumber(
        { maxDecimalPlaces: 2 },
        { message: 'Amount must have at most 2 decimal places' },
    )
    @Min(0.01, { message: 'Amount must be greater than zero' })
    amount: number;

    @IsOptional()
    @IsString()
    note?: string;

    @IsOptional()
    @IsDateString({}, { message: 'Transaction date must be a valid ISO date' })
    transactionDate?: string;

    @ValidateIf((o) => o.type === TransactionType.TRANSFER)
    @IsUUID('4', { message: 'To Account ID must be a valid UUID' })
    @IsOptional()
    toAccountId?: string;
}
