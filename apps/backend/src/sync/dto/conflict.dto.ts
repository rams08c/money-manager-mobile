export class ConflictDto {
    entityType: 'account' | 'transaction' | 'budget' | 'category';
    entityId: string;
    clientVersion: any;
    serverVersion: any;
    resolution: 'server_won' | 'client_won';
    reason: string;

    constructor(partial: Partial<ConflictDto>) {
        Object.assign(this, partial);
    }
}
