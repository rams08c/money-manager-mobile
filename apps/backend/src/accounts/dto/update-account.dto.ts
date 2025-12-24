import {
    IsString,
    IsEnum,
    IsNumber,
    IsOptional,
    MinLength,
    MaxLength,
} from 'class-validator';
import { AccountType } from '../enums';

export class UpdateAccountDto {
    @IsOptional()
    @IsString()
    @MinLength(1, { message: 'Account name must not be empty' })
    @MaxLength(100, { message: 'Account name must not exceed 100 characters' })
    name?: string;

    @IsOptional()
    @IsEnum(AccountType, {
        message: 'Account type must be one of: CASH, BANK, WALLET, CREDIT_CARD',
    })
    type?: AccountType;

    @IsOptional()
    @IsNumber(
        { maxDecimalPlaces: 2 },
        { message: 'Opening balance must have at most 2 decimal places' },
    )
    openingBalance?: number;
}
