import { UnauthorizedException } from '@nestjs/common';

export class InvalidCredentialsException extends UnauthorizedException {
    constructor() {
        super({
            statusCode: 401,
            errorCode: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password',
        });
    }
}
