import {
    IsDateString,
    IsOptional,
    IsUUID,
    IsEnum,
} from 'class-validator';

export class DateRangeReportQueryDto {
    @IsDateString({}, { message: 'Start date must be a valid ISO date' })
    startDate: string;

    @IsDateString({}, { message: 'End date must be a valid ISO date' })
    endDate: string;

    @IsOptional()
    @IsUUID('4', { message: 'Category ID must be a valid UUID' })
    categoryId?: string;

    @IsOptional()
    @IsUUID('4', { message: 'Account ID must be a valid UUID' })
    accountId?: string;

    @IsOptional()
    @IsEnum(['INCOME', 'EXPENSE'], {
        message: 'Type must be INCOME or EXPENSE',
    })
    type?: 'INCOME' | 'EXPENSE';
}
