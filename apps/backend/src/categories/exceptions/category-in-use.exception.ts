import { ConflictException } from '@nestjs/common';

export class CategoryInUseException extends ConflictException {
    constructor() {
        super('Category is in use by transactions or budgets');
    }
}
