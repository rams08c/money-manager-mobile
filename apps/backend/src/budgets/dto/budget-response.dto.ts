export class BudgetResponseDto {
    id: string;
    userId: string;
    categoryId: string;
    amount: number;
    month: string;
    createdAt: Date;
    updatedAt: Date;

    constructor(partial: Partial<BudgetResponseDto>) {
        Object.assign(this, partial);
    }
}
