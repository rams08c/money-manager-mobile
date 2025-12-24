import { ForbiddenException } from '@nestjs/common';

export class UnauthorizedAccessException extends ForbiddenException {
    constructor() {
        super({
            statusCode: 403,
            errorCode: 'UNAUTHORIZED_ACCESS',
            message: 'You do not have access to this transaction',
        });
    }
}
