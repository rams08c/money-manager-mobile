import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Alert } from 'react-native';
import { authAPI } from '../api/auth.api';
import { storage } from '../utils/storage';
import { STORAGE_KEYS } from '../utils/constants';
import { User } from '../api/types';
import { sessionEvents } from '../utils/sessionEvents';

/**
 * Auth state interface
 */
interface AuthState {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: User | null;
}

/**
 * Auth context value interface
 */
interface AuthContextValue {
    state: AuthState;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name?: string) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
}

/**
 * Auth context
 */
export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Auth provider props
 */
interface AuthProviderProps {
    children: ReactNode;
}

/**
 * Auth provider component
 * Manages authentication state and provides auth methods
 */
export function AuthProvider({ children }: AuthProviderProps) {
    const [state, setState] = useState<AuthState>({
        isAuthenticated: false,
        isLoading: true,
        user: null,
    });

    /**
     * Check if user is authenticated on mount
     */
    useEffect(() => {
        checkAuth();
    }, []);

    /**
     * Listen for session expiry events
     */
    useEffect(() => {
        const handleSessionExpired = () => {
            // Clear auth state
            setState({
                isAuthenticated: false,
                isLoading: false,
                user: null,
            });

            // Show user-friendly message
            Alert.alert(
                'Session Expired',
                'Your session has expired. Please log in again.',
                [{ text: 'OK' }]
            );
        };

        // Subscribe to session expiry event
        sessionEvents.onSessionExpired(handleSessionExpired);

        // Cleanup listener on unmount
        return () => {
            sessionEvents.offSessionExpired(handleSessionExpired);
        };
    }, []);

    /**
     * Check for stored tokens and validate
     */
    const checkAuth = async () => {
        try {
            const accessToken = await storage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
            const userId = await storage.getItem(STORAGE_KEYS.USER_ID);
            const userEmail = await storage.getItem(STORAGE_KEYS.USER_EMAIL);

            if (accessToken && userId && userEmail) {
                // User has tokens - consider them authenticated
                // The API client will handle token refresh if needed
                setState({
                    isAuthenticated: true,
                    isLoading: false,
                    user: {
                        id: userId,
                        email: userEmail,
                        name: null,
                        defaultCurrency: null,
                        createdAt: '',
                        updatedAt: '',
                    },
                });
            } else {
                setState({
                    isAuthenticated: false,
                    isLoading: false,
                    user: null,
                });
            }
        } catch (error) {
            console.error('Error checking auth:', error);
            setState({
                isAuthenticated: false,
                isLoading: false,
                user: null,
            });
        }
    };

    /**
     * Login with email and password
     */
    const login = async (email: string, password: string) => {
        const response = await authAPI.login({ email, password });

        // Store tokens
        await storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.accessToken);
        await storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);

        // Decode JWT to get user info (simple base64 decode)
        const payload = JSON.parse(atob(response.accessToken.split('.')[1]));
        await storage.setItem(STORAGE_KEYS.USER_ID, payload.sub);
        await storage.setItem(STORAGE_KEYS.USER_EMAIL, payload.email);

        // Update state
        setState({
            isAuthenticated: true,
            isLoading: false,
            user: {
                id: payload.sub,
                email: payload.email,
                name: null,
                defaultCurrency: null,
                createdAt: '',
                updatedAt: '',
            },
        });
    };

    /**
     * Register a new user
     */
    const register = async (email: string, password: string, name?: string) => {
        const response = await authAPI.register({ email, password, name });

        // Store tokens
        await storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.accessToken);
        await storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);

        // Decode JWT to get user info
        const payload = JSON.parse(atob(response.accessToken.split('.')[1]));
        await storage.setItem(STORAGE_KEYS.USER_ID, payload.sub);
        await storage.setItem(STORAGE_KEYS.USER_EMAIL, payload.email);

        // Update state
        setState({
            isAuthenticated: true,
            isLoading: false,
            user: {
                id: payload.sub,
                email: payload.email,
                name: name || null,
                defaultCurrency: null,
                createdAt: '',
                updatedAt: '',
            },
        });
    };

    /**
     * Logout - clear tokens and state
     */
    const logout = async () => {
        try {
            // Call logout endpoint (best effort)
            await authAPI.logout();
        } catch (error) {
            // Ignore errors - we'll clear local state anyway
            console.error('Logout API error:', error);
        } finally {
            // Clear tokens
            await storage.clearAuth();

            // Update state
            setState({
                isAuthenticated: false,
                isLoading: false,
                user: null,
            });
        }
    };

    const value: AuthContextValue = {
        state,
        login,
        register,
        logout,
        checkAuth,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
