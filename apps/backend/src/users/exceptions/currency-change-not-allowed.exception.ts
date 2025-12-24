import { BadRequestException } from '@nestjs/common';

export class CurrencyChangeNotAllowedException extends BadRequestException {
    constructor() {
        super({
            statusCode: 400,
            errorCode: 'CURRENCY_CHANGE_NOT_ALLOWED',
            message: 'Cannot change currency after transactions exist',
        });
    }
}
