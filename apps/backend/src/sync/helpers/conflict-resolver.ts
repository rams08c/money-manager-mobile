export class ConflictResolver {
    /**
     * Resolve conflict between client and server records using timestamp comparison
     * Per spec: "Latest updatedAt wins"
     */
    static resolve(
        clientRecord: any,
        serverRecord: any,
    ): {
        winner: any;
        resolution: 'server_won' | 'client_won';
        reason: string;
    } {
        const clientTime = new Date(clientRecord.updatedAt).getTime();
        const serverTime = new Date(serverRecord.updatedAt).getTime();

        // Handle soft deletes
        if (clientRecord.isDeleted && serverRecord.isDeleted) {
            // Both deleted, use latest timestamp
            if (clientTime > serverTime) {
                return {
                    winner: clientRecord,
                    resolution: 'client_won',
                    reason: 'Both deleted, client timestamp newer',
                };
            } else {
                return {
                    winner: serverRecord,
                    resolution: 'server_won',
                    reason: 'Both deleted, server timestamp newer or equal',
                };
            }
        }

        // Compare timestamps (latest wins)
        if (clientTime > serverTime) {
            return {
                winner: clientRecord,
                resolution: 'client_won',
                reason: 'Client timestamp newer',
            };
        } else if (serverTime > clientTime) {
            return {
                winner: serverRecord,
                resolution: 'server_won',
                reason: 'Server timestamp newer',
            };
        } else {
            // Same timestamp - server wins (server is source of truth)
            return {
                winner: serverRecord,
                resolution: 'server_won',
                reason: 'Same timestamp, server is source of truth',
            };
        }
    }
}
