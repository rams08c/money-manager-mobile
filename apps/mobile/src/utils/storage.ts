import * as SecureStore from 'expo-secure-store';
import { StorageKey } from './constants';

/**
 * Secure storage wrapper using Expo SecureStore
 * Provides encrypted storage on iOS (Keychain) and Android (EncryptedSharedPreferences)
 */
export const storage = {
    /**
     * Store a value securely
     */
    async setItem(key: StorageKey, value: string): Promise<void> {
        try {
            await SecureStore.setItemAsync(key, value);
        } catch (error) {
            console.error(`Error storing ${key}:`, error);
            throw error;
        }
    },

    /**
     * Retrieve a value from secure storage
     */
    async getItem(key: StorageKey): Promise<string | null> {
        try {
            return await SecureStore.getItemAsync(key);
        } catch (error) {
            console.error(`Error retrieving ${key}:`, error);
            return null;
        }
    },

    /**
     * Remove a value from secure storage
     */
    async removeItem(key: StorageKey): Promise<void> {
        try {
            await SecureStore.deleteItemAsync(key);
        } catch (error) {
            console.error(`Error removing ${key}:`, error);
            throw error;
        }
    },

    /**
     * Clear all auth-related data
     */
    async clearAuth(): Promise<void> {
        const keys: StorageKey[] = [
            'auth.accessToken',
            'auth.refreshToken',
            'auth.userId',
            'auth.userEmail',
        ];

        await Promise.all(keys.map((key) => this.removeItem(key)));
    },
};
