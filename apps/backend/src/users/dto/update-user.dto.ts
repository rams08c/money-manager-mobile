import { IsString, IsOptional, MinLength, MaxLength, Matches } from 'class-validator';

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    @MinLength(1, { message: 'Name must not be empty' })
    @MaxLength(100, { message: 'Name must not exceed 100 characters' })
    name?: string;

    @IsOptional()
    @IsString()
    @Matches(/^[A-Z]{3}$/, {
        message: 'Currency must be a valid ISO 4217 code (e.g., USD, EUR, INR)',
    })
    defaultCurrency?: string;
}
