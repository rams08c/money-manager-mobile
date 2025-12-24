import { BudgetResponseDto } from './budget-response.dto';

export class BudgetWithSpendingDto extends BudgetResponseDto {
    spent: number;
    remaining: number;
    percentUsed: number;
    status: 'under' | 'near' | 'over';

    constructor(
        budget: Partial<BudgetResponseDto>,
        spent: number,
    ) {
        super(budget);
        this.spent = spent;
        this.remaining = this.amount - spent;
        this.percentUsed = this.amount > 0 ? (spent / this.amount) * 100 : 0;
        this.status = this.determineStatus(spent, this.amount);
    }

    private determineStatus(spent: number, budget: number): 'under' | 'near' | 'over' {
        const percentUsed = budget > 0 ? (spent / budget) * 100 : 0;

        if (percentUsed >= 100) return 'over';
        if (percentUsed >= 80) return 'near';
        return 'under';
    }
}
