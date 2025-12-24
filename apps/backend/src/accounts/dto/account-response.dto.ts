import { AccountType } from '../enums';

export class AccountResponseDto {
    id: string;
    userId: string;
    name: string;
    type: AccountType;
    currency: string;
    openingBalance: number;
    createdAt: Date;

    constructor(partial: Partial<AccountResponseDto>) {
        Object.assign(this, partial);
    }
}
