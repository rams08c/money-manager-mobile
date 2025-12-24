export class CategoryBreakdownDto {
    categoryId: string;
    categoryName: string;
    totalAmount: number;
    transactionCount: number;
    percentage: number;

    constructor(partial: Partial<CategoryBreakdownDto>) {
        Object.assign(this, partial);
    }
}
