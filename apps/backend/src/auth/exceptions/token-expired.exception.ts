import { UnauthorizedException } from '@nestjs/common';

export class TokenExpiredException extends UnauthorizedException {
    constructor() {
        super({
            statusCode: 401,
            errorCode: 'TOKEN_EXPIRED',
            message: 'Token has expired',
        });
    }
}
