import {
    IsUUID,
    IsNumber,
    IsString,
    Matches,
    Min,
} from 'class-validator';

export class CreateBudgetDto {
    @IsUUID('4', { message: 'Category ID must be a valid UUID' })
    categoryId: string;

    @IsNumber(
        { maxDecimalPlaces: 2 },
        { message: 'Amount must have at most 2 decimal places' },
    )
    @Min(0.01, { message: 'Amount must be greater than zero' })
    amount: number;

    @IsString()
    @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
        message: 'Month must be in YYYY-MM format (e.g., 2025-01)',
    })
    month: string;
}
