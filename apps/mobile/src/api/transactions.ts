import { apiClient } from './client';
import { Transaction, TransactionResponse } from './types';

/**
 * Create transaction request
 */
export interface CreateTransactionRequest {
    accountId: string;
    categoryId?: string; // Not required for TRANSFER
    type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
    amount: number;
    note?: string;
    transactionDate: string;
    toAccountId?: string; // Required for TRANSFER
}

/**
 * Update transaction request
 */
export interface UpdateTransactionRequest {
    accountId?: string;
    categoryId?: string;
    amount?: number;
    note?: string;
    transactionDate?: string;
}

/**
 * Transactions API client - handles transaction endpoints
 */
export const transactionsAPI = {
    /**
     * Get all transactions for current user
     * Supports pagination and filtering
     */
    async getTransactions(params?: {
        page?: number;
        limit?: number;
        accountId?: string;
        type?: 'INCOME' | 'EXPENSE' | 'TRANSFER';
        startDate?: string;
        endDate?: string;
    }): Promise<Transaction[]> {
        const queryParams = new URLSearchParams();

        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.accountId) queryParams.append('accountId', params.accountId);
        if (params?.type) queryParams.append('type', params.type);
        if (params?.startDate) queryParams.append('startDate', params.startDate);
        if (params?.endDate) queryParams.append('endDate', params.endDate);

        const query = queryParams.toString();
        const url = query ? `/transactions?${query}` : '/transactions';

        return apiClient.get<Transaction[]>(url);
    },

    /**
     * Create new transaction
     */
    async createTransaction(data: CreateTransactionRequest): Promise<TransactionResponse> {
        return apiClient.post<TransactionResponse>('/transactions', data);
    },

    /**
     * Update transaction
     */
    async updateTransaction(id: string, data: UpdateTransactionRequest): Promise<TransactionResponse> {
        return apiClient.put<TransactionResponse>(`/transactions/${id}`, data);
    },

    /**
     * Delete transaction
     */
    async deleteTransaction(id: string): Promise<void> {
        return apiClient.delete<void>(`/transactions/${id}`);
    },
};
