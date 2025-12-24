import { TransactionType } from '../enums';

export class TransactionResponseDto {
    id: string;
    userId: string;
    accountId: string;
    categoryId: string;
    type: TransactionType;
    amount: number;
    note: string | null;
    transactionDate: Date;
    linkedTransactionId: string | null;
    createdAt: Date;
    updatedAt: Date;
    // Optional populated relations
    account?: any;
    category?: any;
    linkedTransaction?: any;

    constructor(partial: Partial<TransactionResponseDto>) {
        Object.assign(this, partial);
    }
}
