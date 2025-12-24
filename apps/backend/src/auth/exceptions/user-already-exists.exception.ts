import { ConflictException } from '@nestjs/common';

export class UserAlreadyExistsException extends ConflictException {
    constructor() {
        super({
            statusCode: 409,
            errorCode: 'USER_ALREADY_EXISTS',
            message: 'User with this email already exists',
        });
    }
}
