import { NotFoundException } from '@nestjs/common';

export class BudgetNotFoundException extends NotFoundException {
    constructor() {
        super({
            statusCode: 404,
            errorCode: 'BUDGET_NOT_FOUND',
            message: 'Budget not found',
        });
    }
}
