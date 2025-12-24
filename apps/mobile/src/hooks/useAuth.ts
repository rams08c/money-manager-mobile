import { useContext } from 'react';
import { AuthContext } from '../store/AuthContext';

/**
 * Custom hook to use auth context
 * Must be used within AuthProvider
 */
export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }

    return context;
}
