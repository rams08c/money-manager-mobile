import { IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateBudgetDto {
    @IsOptional()
    @IsNumber(
        { maxDecimalPlaces: 2 },
        { message: 'Amount must have at most 2 decimal places' },
    )
    @Min(0.01, { message: 'Amount must be greater than zero' })
    amount?: number;
}
