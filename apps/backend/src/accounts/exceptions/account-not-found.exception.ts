import { NotFoundException } from '@nestjs/common';

export class AccountNotFoundException extends NotFoundException {
    constructor() {
        super({
            statusCode: 404,
            errorCode: 'ACCOUNT_NOT_FOUND',
            message: 'Account not found',
        });
    }
}
