import { BadRequestException } from '@nestjs/common';

export class TransferCannotBeModifiedException extends BadRequestException {
    constructor() {
        super({
            statusCode: 400,
            errorCode: 'TRANSFER_CANNOT_BE_MODIFIED',
            message: 'Transfer transactions cannot be modified',
        });
    }
}
