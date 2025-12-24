import { ConflictDto } from './conflict.dto';

export class SyncChangesDto {
    accounts: any[];
    transactions: any[];
    budgets: any[];
    categories: any[];

    constructor() {
        this.accounts = [];
        this.transactions = [];
        this.budgets = [];
        this.categories = [];
    }
}

export class SyncResponseDto {
    serverTime: Date;
    changes: SyncChangesDto;
    conflicts: ConflictDto[];
    syncedAt: Date;

    constructor(partial: Partial<SyncResponseDto>) {
        Object.assign(this, partial);
        this.changes = this.changes || new SyncChangesDto();
        this.conflicts = this.conflicts || [];
    }
}
