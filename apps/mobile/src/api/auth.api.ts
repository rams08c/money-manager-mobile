import { apiClient } from './client';
import { AuthResponse, LoginRequest, RegisterRequest } from './types';

/**
 * Auth API client - handles authentication endpoints
 * No business logic - just API calls
 */
export const authAPI = {
    /**
     * Register a new user
     */
    async register(data: RegisterRequest): Promise<AuthResponse> {
        return apiClient.post<AuthResponse>('/auth/register', data);
    },

    /**
     * Login with email and password
     */
    async login(data: LoginRequest): Promise<AuthResponse> {
        return apiClient.post<AuthResponse>('/auth/login', data);
    },

    /**
     * Refresh access token using refresh token
     */
    async refresh(refreshToken: string): Promise<AuthResponse> {
        return apiClient.post<AuthResponse>('/auth/refresh', { refreshToken });
    },

    /**
     * Logout - invalidate refresh token on server
     */
    async logout(): Promise<void> {
        return apiClient.post<void>('/auth/logout');
    },
};
