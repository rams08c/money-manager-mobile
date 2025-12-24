import { apiClient } from './client';
import { MonthlySummary, CategoryBreakdown, BudgetVsActual } from './types';

/**
 * Reports API client - handles report endpoints
 */
export const reportsAPI = {
    /**
     * Get monthly summary report
     */
    async getMonthlySummary(month: string, accountId?: string): Promise<MonthlySummary> {
        const params = new URLSearchParams({ month });
        if (accountId) params.append('accountId', accountId);
        return apiClient.get<MonthlySummary>(`/reports/monthly?${params.toString()}`);
    },

    /**
     * Get category breakdown report
     */
    async getCategoryBreakdown(
        startDate: string,
        endDate: string,
        type?: 'INCOME' | 'EXPENSE',
        categoryId?: string
    ): Promise<CategoryBreakdown[]> {
        const params = new URLSearchParams({ startDate, endDate });
        if (type) params.append('type', type);
        if (categoryId) params.append('categoryId', categoryId);
        return apiClient.get<CategoryBreakdown[]>(`/reports/categories?${params.toString()}`);
    },

    /**
     * Get budget vs actual report
     */
    async getBudgetVsActual(month: string): Promise<BudgetVsActual[]> {
        return apiClient.get<BudgetVsActual[]>(`/reports/budget-vs-actual?month=${month}`);
    },
};
