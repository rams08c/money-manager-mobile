import {
    IsUUID,
    IsNumber,
    IsString,
    IsOptional,
    IsDateString,
    Min,
} from 'class-validator';

export class UpdateTransactionDto {
    @IsOptional()
    @IsUUID('4', { message: 'Category ID must be a valid UUID' })
    categoryId?: string;

    @IsOptional()
    @IsNumber(
        { maxDecimalPlaces: 2 },
        { message: 'Amount must have at most 2 decimal places' },
    )
    @Min(0.01, { message: 'Amount must be greater than zero' })
    amount?: number;

    @IsOptional()
    @IsString()
    note?: string;

    @IsOptional()
    @IsDateString({}, { message: 'Transaction date must be a valid ISO date' })
    transactionDate?: string;
}
