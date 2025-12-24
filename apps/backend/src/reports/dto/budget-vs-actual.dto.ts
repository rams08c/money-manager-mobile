export class BudgetVsActualDto {
    categoryId: string;
    categoryName: string;
    budgetAmount: number;
    actualAmount: number;
    difference: number;
    percentageUsed: number;
    status: 'under' | 'near' | 'over';

    constructor(partial: Partial<BudgetVsActualDto>) {
        Object.assign(this, partial);
    }
}
