/**
 * API Error Codes from backend
 */
export enum AuthErrorCode {
    INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
    USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',
    TOKEN_EXPIRED = 'TOKEN_EXPIRED',
    NETWORK_ERROR = 'NETWORK_ERROR',
    UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Map error codes to user-friendly messages
 */
export function getErrorMessage(error: any): string {
    // Check for network errors
    if (error.message === 'Network Error' || !error.response) {
        return 'Unable to connect. Please check your internet connection.';
    }

    // Check for backend error codes
    const errorCode = error.response?.data?.error;

    switch (errorCode) {
        case AuthErrorCode.INVALID_CREDENTIALS:
            return 'Invalid email or password. Please try again.';
        case AuthErrorCode.USER_ALREADY_EXISTS:
            return 'An account with this email already exists.';
        case AuthErrorCode.TOKEN_EXPIRED:
            return 'Your session has expired. Please login again.';
        default:
            // Check for validation errors
            if (error.response?.data?.message) {
                const message = error.response.data.message;
                if (Array.isArray(message)) {
                    return message[0]; // Return first validation error
                }
                return message;
            }
            return 'Something went wrong. Please try again.';
    }
}
