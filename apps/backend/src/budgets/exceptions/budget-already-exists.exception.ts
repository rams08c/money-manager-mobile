import { ConflictException } from '@nestjs/common';

export class BudgetAlreadyExistsException extends ConflictException {
    constructor() {
        super({
            statusCode: 409,
            errorCode: 'BUDGET_ALREADY_EXISTS',
            message: 'Budget already exists for this category and month',
        });
    }
}
