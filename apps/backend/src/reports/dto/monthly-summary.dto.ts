export class CategorySummaryDto {
    categoryId: string;
    categoryName: string;
    totalAmount: number;
    transactionCount: number;
    percentage: number;
}

export class AccountBalanceDto {
    accountId: string;
    accountName: string;
    openingBalance: number;
    closingBalance: number;
    change: number;
}

export class MonthlySummaryDto {
    month: string;
    totalIncome: number;
    totalExpenses: number;
    netIncome: number;
    incomeCount: number;
    expenseCount: number;
    topCategories: CategorySummaryDto[];
    accountBalances: AccountBalanceDto[];

    constructor(partial: Partial<MonthlySummaryDto>) {
        Object.assign(this, partial);
        this.topCategories = this.topCategories || [];
        this.accountBalances = this.accountBalances || [];
    }
}
