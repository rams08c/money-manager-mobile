import { apiClient } from './client';
import { Account } from './types';

/**
 * Create account request
 */
export interface CreateAccountRequest {
    name: string;
    type: 'CASH' | 'BANK' | 'WALLET' | 'CREDIT_CARD';
    currency: string;
    openingBalance: string;
}

/**
 * Update account request
 */
export interface UpdateAccountRequest {
    name: string; // Only name is editable
}

/**
 * Accounts API client - handles account endpoints
 */
export const accountsAPI = {
    /**
     * Get all accounts for current user
     */
    async getAccounts(): Promise<Account[]> {
        return apiClient.get<Account[]>('/accounts');
    },

    /**
     * Create new account
     */
    async createAccount(data: CreateAccountRequest): Promise<Account> {
        return apiClient.post<Account>('/accounts', data);
    },

    /**
     * Update account (only name can be changed)
     */
    async updateAccount(id: string, data: UpdateAccountRequest): Promise<Account> {
        return apiClient.put<Account>(`/accounts/${id}`, data);
    },

    /**
     * Delete account
     */
    async deleteAccount(id: string): Promise<void> {
        return apiClient.delete<void>(`/accounts/${id}`);
    },
};
