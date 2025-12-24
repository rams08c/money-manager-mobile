import { NotFoundException } from '@nestjs/common';

export class UserNotFoundException extends NotFoundException {
    constructor() {
        super({
            statusCode: 404,
            errorCode: 'USER_NOT_FOUND',
            message: 'User not found',
        });
    }
}
