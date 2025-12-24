import { AccountResponseDto } from './account-response.dto';

export class AccountWithBalanceDto extends AccountResponseDto {
    balance: number;

    constructor(partial: Partial<AccountWithBalanceDto>) {
        super(partial);
        this.balance = partial.balance || 0;
    }
}
