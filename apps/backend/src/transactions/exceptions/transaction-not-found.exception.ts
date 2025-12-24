import { NotFoundException } from '@nestjs/common';

export class TransactionNotFoundException extends NotFoundException {
    constructor() {
        super({
            statusCode: 404,
            errorCode: 'TRANSACTION_NOT_FOUND',
            message: 'Transaction not found',
        });
    }
}
