import { TransactionResponseDto } from './transaction-response.dto';

export class TransferResponseDto {
    transferId: string;
    fromTransaction: TransactionResponseDto;
    toTransaction: TransactionResponseDto;
    amount: number;
    status: 'completed';

    constructor(
        fromTx: TransactionResponseDto,
        toTx: TransactionResponseDto,
    ) {
        this.transferId = fromTx.id;
        this.fromTransaction = fromTx;
        this.toTransaction = toTx;
        this.amount = Math.abs(fromTx.amount);
        this.status = 'completed';
    }
}
