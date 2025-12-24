import { IsString, IsOptional, IsUUID, Matches } from 'class-validator';

export class MonthlyReportQueryDto {
    @IsString()
    @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
        message: 'Month must be in YYYY-MM format (e.g., 2025-01)',
    })
    month: string;

    @IsOptional()
    @IsUUID('4', { message: 'Account ID must be a valid UUID' })
    accountId?: string;
}
