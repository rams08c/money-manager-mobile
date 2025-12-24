/**
 * Session event types
 */
export enum SessionEventType {
    SESSION_EXPIRED = 'SESSION_EXPIRED',
    SESSION_REFRESHED = 'SESSION_REFRESHED',
}

/**
 * Session expired error class
 */
export class SessionExpiredError extends Error {
    constructor(message: string = 'Your session has expired. Please log in again.') {
        super(message);
        this.name = 'SessionExpiredError';
    }
}

/**
 * Simple event emitter for session management (React Native compatible)
 */
class SessionEventEmitter {
    private listeners: Map<SessionEventType, Set<() => void>> = new Map();

    /**
     * Emit session expired event
     */
    emitSessionExpired(): void {
        this.emit(SessionEventType.SESSION_EXPIRED);
    }

    /**
     * Emit session refreshed event
     */
    emitSessionRefreshed(): void {
        this.emit(SessionEventType.SESSION_REFRESHED);
    }

    /**
     * Listen to session expired event
     */
    onSessionExpired(callback: () => void): void {
        this.on(SessionEventType.SESSION_EXPIRED, callback);
    }

    /**
     * Listen to session refreshed event
     */
    onSessionRefreshed(callback: () => void): void {
        this.on(SessionEventType.SESSION_REFRESHED, callback);
    }

    /**
     * Remove session expired listener
     */
    offSessionExpired(callback: () => void): void {
        this.off(SessionEventType.SESSION_EXPIRED, callback);
    }

    /**
     * Remove session refreshed listener
     */
    offSessionRefreshed(callback: () => void): void {
        this.off(SessionEventType.SESSION_REFRESHED, callback);
    }

    // Internal methods
    private emit(eventType: SessionEventType): void {
        const callbacks = this.listeners.get(eventType);
        if (callbacks) {
            callbacks.forEach(callback => callback());
        }
    }

    private on(eventType: SessionEventType, callback: () => void): void {
        if (!this.listeners.has(eventType)) {
            this.listeners.set(eventType, new Set());
        }
        this.listeners.get(eventType)!.add(callback);
    }

    private off(eventType: SessionEventType, callback: () => void): void {
        const callbacks = this.listeners.get(eventType);
        if (callbacks) {
            callbacks.delete(callback);
        }
    }
}

// Export singleton instance
export const sessionEvents = new SessionEventEmitter();
