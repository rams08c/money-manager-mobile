import { ForbiddenException } from '@nestjs/common';

export class CategoryIsSystemException extends ForbiddenException {
    constructor() {
        super('System categories cannot be modified');
    }
}
