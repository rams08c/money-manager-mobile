import { ConflictException } from '@nestjs/common';

export class DuplicateCategoryNameException extends ConflictException {
    constructor() {
        super('Category name already exists');
    }
}
