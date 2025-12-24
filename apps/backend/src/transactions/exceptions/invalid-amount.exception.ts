import { BadRequestException } from '@nestjs/common';

export class InvalidAmountException extends BadRequestException {
    constructor() {
        super({
            statusCode: 400,
            errorCode: 'INVALID_AMOUNT',
            message: 'Amount must be greater than zero',
        });
    }
}
