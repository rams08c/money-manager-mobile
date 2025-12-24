import {
    IsString,
    IsEnum,
    MinLength,
    MaxLength,
    Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AccountType } from '../enums';

export class CreateAccountDto {
    @IsString()
    @MinLength(1, { message: 'Account name must not be empty' })
    @MaxLength(100, { message: 'Account name must not exceed 100 characters' })
    name: string;

    @IsEnum(AccountType, {
        message: 'Account type must be one of: CASH, BANK, WALLET, CREDIT_CARD',
    })
    type: AccountType;

    @IsString()
    @Matches(/^[A-Z]{3}$/, {
        message: 'Currency must be a valid ISO 4217 code (e.g., USD, EUR, INR)',
    })
    currency: string;

    @IsString()
    @Matches(/^\d+(\.\d{1,2})?$/, {
        message: 'Opening balance must be a valid number with at most 2 decimal places',
    })
    @Type(() => String)
    openingBalance: string;
}
