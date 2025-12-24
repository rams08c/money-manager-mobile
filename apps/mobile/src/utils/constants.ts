// Storage keys for SecureStore
export const STORAGE_KEYS = {
    ACCESS_TOKEN: 'auth.accessToken',
    REFRESH_TOKEN: 'auth.refreshToken',
    USER_ID: 'auth.userId',
    USER_EMAIL: 'auth.userEmail',
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];
