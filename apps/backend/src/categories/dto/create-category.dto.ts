import { IsString, IsEnum, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateCategoryDto {
    @IsString()
    @IsNotEmpty({ message: 'Category name is required' })
    @MaxLength(50, { message: 'Category name must not exceed 50 characters' })
    name: string;

    @IsEnum(['INCOME', 'EXPENSE'], {
        message: 'Category type must be either INCOME or EXPENSE',
    })
    type: 'INCOME' | 'EXPENSE';
}
