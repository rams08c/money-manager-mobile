import { apiClient } from './client';
import { Budget } from './types';

/**
 * Create budget request
 */
export interface CreateBudgetRequest {
    categoryId: string;
    amount: string;
    month: string; // YYYY-MM format
}

/**
 * Update budget request
 */
export interface UpdateBudgetRequest {
    amount: string; // Only amount is editable
}

/**
 * Budgets API client - handles budget endpoints
 */
export const budgetsAPI = {
    /**
     * Get all budgets for current user
     * Optionally filter by month
     */
    async getBudgets(month?: string): Promise<Budget[]> {
        const url = month ? `/budgets?month=${month}` : '/budgets';
        return apiClient.get<Budget[]>(url);
    },

    /**
     * Create new budget
     */
    async createBudget(data: CreateBudgetRequest): Promise<Budget> {
        return apiClient.post<Budget>('/budgets', data);
    },

    /**
     * Update budget (only amount can be changed)
     */
    async updateBudget(id: string, data: UpdateBudgetRequest): Promise<Budget> {
        return apiClient.put<Budget>(`/budgets/${id}`, data);
    },

    /**
     * Delete budget
     */
    async deleteBudget(id: string): Promise<void> {
        return apiClient.delete<void>(`/budgets/${id}`);
    },
};
