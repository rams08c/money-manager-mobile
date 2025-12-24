import { IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class CategoryQueryDto {
    @IsEnum(['INCOME', 'EXPENSE'], {
        message: 'Type must be either INCOME or EXPENSE',
    })
    @IsOptional()
    type?: 'INCOME' | 'EXPENSE';

    @IsBoolean({ message: 'isDeleted must be a boolean' })
    @IsOptional()
    @Transform(({ value }) => {
        if (value === 'true') return true;
        if (value === 'false') return false;
        return value;
    })
    isDeleted?: boolean = false;
}
