import axios, { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { storage } from '../utils/storage';
import { STORAGE_KEYS } from '../utils/constants';
import { sessionEvents, SessionExpiredError } from '../utils/sessionEvents';

// Base API URL - update this to match your backend
const API_BASE_URL = 'http://localhost:3000';

/**
 * Base HTTP client with automatic token injection and refresh
 */
class APIClient {
    private client: AxiosInstance;
    private isRefreshing = false;
    private refreshSubscribers: ((token: string | null) => void)[] = [];

    constructor() {
        this.client = axios.create({
            baseURL: API_BASE_URL,
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 10000,
        });

        this.setupInterceptors();
    }

    private setupInterceptors() {
        // Request interceptor - inject access token
        this.client.interceptors.request.use(
            async (config: InternalAxiosRequestConfig) => {
                // Skip token injection for auth endpoints
                const isAuthEndpoint = config.url?.includes('/auth/login') ||
                    config.url?.includes('/auth/register');

                if (!isAuthEndpoint) {
                    const accessToken = await storage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
                    if (accessToken && config.headers) {
                        config.headers.Authorization = `Bearer ${accessToken}`;
                    }
                }

                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response interceptor - handle 401 and token refresh
        this.client.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;

                // If error is 401 and we haven't tried to refresh yet
                if (error.response?.status === 401 && !originalRequest._retry) {
                    if (this.isRefreshing) {
                        // Wait for the ongoing refresh to complete
                        return new Promise((resolve, reject) => {
                            this.refreshSubscribers.push((token: string | null) => {
                                if (token) {
                                    // Refresh succeeded - retry with new token
                                    originalRequest.headers.Authorization = `Bearer ${token}`;
                                    resolve(this.client(originalRequest));
                                } else {
                                    // Refresh failed - reject this request
                                    reject(new SessionExpiredError());
                                }
                            });
                        });
                    }

                    originalRequest._retry = true;
                    this.isRefreshing = true;

                    try {
                        const refreshToken = await storage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

                        if (!refreshToken) {
                            throw new Error('No refresh token available');
                        }

                        // Call refresh endpoint using separate axios instance to avoid interceptor loop
                        const refreshClient = axios.create({
                            baseURL: API_BASE_URL,
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            timeout: 10000,
                        });

                        const response = await refreshClient.post('/auth/refresh', {
                            refreshToken,
                        });

                        const { accessToken, refreshToken: newRefreshToken } = response.data;

                        // Store new tokens
                        await storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
                        await storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);

                        // Notify all waiting requests with new token
                        this.refreshSubscribers.forEach((callback) => callback(accessToken));
                        this.refreshSubscribers = [];

                        // Emit session refreshed event
                        sessionEvents.emitSessionRefreshed();

                        // Retry original request with new token
                        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                        return this.client(originalRequest);
                    } catch (refreshError) {
                        // Refresh failed - clear tokens and notify all waiting requests
                        await storage.clearAuth();

                        // CRITICAL FIX: Reject all queued promises with null token
                        this.refreshSubscribers.forEach((callback) => callback(null));
                        this.refreshSubscribers = [];

                        // Emit session expired event
                        sessionEvents.emitSessionExpired();

                        // Reject the original request
                        return Promise.reject(new SessionExpiredError());
                    } finally {
                        this.isRefreshing = false;
                    }
                }

                return Promise.reject(error);
            }
        );
    }

    /**
     * Get the axios instance
     */
    getInstance(): AxiosInstance {
        return this.client;
    }

    /**
     * Make a GET request
     */
    async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.get<T>(url, config);
        return response.data;
    }

    /**
     * Make a POST request
     */
    async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.post<T>(url, data, config);
        return response.data;
    }

    /**
     * Make a PUT request
     */
    async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.put<T>(url, data, config);
        return response.data;
    }

    /**
     * Make a DELETE request
     */
    async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response = await this.client.delete<T>(url, config);
        return response.data;
    }
}

// Export singleton instance
export const apiClient = new APIClient();
