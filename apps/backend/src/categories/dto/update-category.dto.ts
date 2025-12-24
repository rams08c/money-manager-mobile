import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateCategoryDto {
    @IsString()
    @IsOptional()
    @MaxLength(50, { message: 'Category name must not exceed 50 characters' })
    name?: string;
}
