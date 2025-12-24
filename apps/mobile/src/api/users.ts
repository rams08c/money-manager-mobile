import { apiClient } from './client';
import { User } from './types';

/**
 * Update user profile request
 */
export interface UpdateUserRequest {
    name?: string;
    email?: string;
    defaultCurrency?: string;
}

/**
 * User API client - handles user profile endpoints
 */
export const userAPI = {
    /**
     * Get current user profile
     */
    async getProfile(): Promise<User> {
        return apiClient.get<User>('/users/me');
    },

    /**
     * Update current user profile
     */
    async updateProfile(data: UpdateUserRequest): Promise<User> {
        return apiClient.put<User>('/users/me', data);
    },
};
