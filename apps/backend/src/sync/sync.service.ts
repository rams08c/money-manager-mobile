import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
    SyncPushDto,
    SyncResponseDto,
    SyncChangesDto,
    ConflictDto,
} from './dto';
import { ConflictResolver } from './helpers';

@Injectable()
export class SyncService {
    private readonly logger = new Logger(SyncService.name);

    constructor(private prisma: PrismaService) { }

    async sync(userId: string, syncPushDto: SyncPushDto): Promise<SyncResponseDto> {
        const serverTime = new Date();
        const conflicts: ConflictDto[] = [];
        const changes = new SyncChangesDto();

        // Parse lastSyncAt or use epoch if first sync
        const lastSyncAt = syncPushDto.lastSyncAt
            ? new Date(syncPushDto.lastSyncAt)
            : new Date(0);

        // Process client changes (PUSH)
        if (syncPushDto.accounts?.length) {
            const accountConflicts = await this.syncAccounts(
                userId,
                syncPushDto.accounts,
            );
            conflicts.push(...accountConflicts);
        }

        if (syncPushDto.transactions?.length) {
            const txConflicts = await this.syncTransactions(
                userId,
                syncPushDto.transactions,
            );
            conflicts.push(...txConflicts);
        }

        if (syncPushDto.budgets?.length) {
            const budgetConflicts = await this.syncBudgets(
                userId,
                syncPushDto.budgets,
            );
            conflicts.push(...budgetConflicts);
        }

        // Get server changes (PULL)
        changes.accounts = await this.getServerChanges(
            'account',
            userId,
            lastSyncAt,
        );
        changes.transactions = await this.getServerChanges(
            'transaction',
            userId,
            lastSyncAt,
        );
        changes.budgets = await this.getServerChanges('budget', userId, lastSyncAt);

        return new SyncResponseDto({
            serverTime,
            changes,
            conflicts,
            syncedAt: serverTime,
        });
    }

    private async syncAccounts(
        userId: string,
        accounts: any[],
    ): Promise<ConflictDto[]> {
        const conflicts: ConflictDto[] = [];

        for (const clientAccount of accounts) {
            try {
                const serverAccount = await this.prisma.account.findUnique({
                    where: { id: clientAccount.id },
                });

                if (serverAccount) {
                    // Record exists, resolve conflict
                    const { winner, resolution, reason } = ConflictResolver.resolve(
                        clientAccount,
                        serverAccount,
                    );

                    if (resolution === 'client_won') {
                        // Update with client version
                        await this.prisma.account.update({
                            where: { id: clientAccount.id },
                            data: {
                                name: clientAccount.name,
                                type: clientAccount.type,
                                openingBalance: clientAccount.openingBalance,
                                isDeleted: clientAccount.isDeleted,
                                updatedAt: new Date(clientAccount.updatedAt),
                            },
                        });
                    } else {
                        // Server won, track conflict
                        conflicts.push(
                            new ConflictDto({
                                entityType: 'account',
                                entityId: clientAccount.id,
                                clientVersion: clientAccount,
                                serverVersion: serverAccount,
                                resolution,
                                reason,
                            }),
                        );
                    }
                } else {
                    // New record, create it (idempotent with client-provided ID)
                    await this.prisma.account.create({
                        data: {
                            id: clientAccount.id,
                            userId,
                            name: clientAccount.name,
                            type: clientAccount.type,
                            currency: clientAccount.currency,
                            openingBalance: clientAccount.openingBalance,
                            isDeleted: clientAccount.isDeleted || false,
                            createdAt: new Date(clientAccount.createdAt),
                            updatedAt: new Date(clientAccount.updatedAt),
                        },
                    });
                }
            } catch (error) {
                this.logger.error(
                    `Error syncing account ${clientAccount.id}: ${error.message}`,
                );
            }
        }

        return conflicts;
    }

    private async syncTransactions(
        userId: string,
        transactions: any[],
    ): Promise<ConflictDto[]> {
        const conflicts: ConflictDto[] = [];

        for (const clientTx of transactions) {
            try {
                const serverTx = await this.prisma.transaction.findUnique({
                    where: { id: clientTx.id },
                });

                if (serverTx) {
                    // Resolve conflict
                    const { winner, resolution, reason } = ConflictResolver.resolve(
                        clientTx,
                        serverTx,
                    );

                    if (resolution === 'client_won') {
                        await this.prisma.transaction.update({
                            where: { id: clientTx.id },
                            data: {
                                accountId: clientTx.accountId,
                                categoryId: clientTx.categoryId,
                                type: clientTx.type,
                                amount: clientTx.amount,
                                note: clientTx.note,
                                transactionDate: new Date(clientTx.transactionDate),
                                isDeleted: clientTx.isDeleted,
                                updatedAt: new Date(clientTx.updatedAt),
                            },
                        });
                    } else {
                        conflicts.push(
                            new ConflictDto({
                                entityType: 'transaction',
                                entityId: clientTx.id,
                                clientVersion: clientTx,
                                serverVersion: serverTx,
                                resolution,
                                reason,
                            }),
                        );
                    }
                } else {
                    // Create new transaction
                    await this.prisma.transaction.create({
                        data: {
                            id: clientTx.id,
                            userId,
                            accountId: clientTx.accountId,
                            categoryId: clientTx.categoryId,
                            type: clientTx.type,
                            amount: clientTx.amount,
                            note: clientTx.note,
                            transactionDate: new Date(clientTx.transactionDate),
                            linkedTransactionId: clientTx.linkedTransactionId,
                            isDeleted: clientTx.isDeleted || false,
                            createdAt: new Date(clientTx.createdAt),
                            updatedAt: new Date(clientTx.updatedAt),
                        },
                    });
                }
            } catch (error) {
                this.logger.error(
                    `Error syncing transaction ${clientTx.id}: ${error.message}`,
                );
            }
        }

        return conflicts;
    }

    private async syncBudgets(
        userId: string,
        budgets: any[],
    ): Promise<ConflictDto[]> {
        const conflicts: ConflictDto[] = [];

        for (const clientBudget of budgets) {
            try {
                const serverBudget = await this.prisma.budget.findUnique({
                    where: { id: clientBudget.id },
                });

                if (serverBudget) {
                    const { winner, resolution, reason } = ConflictResolver.resolve(
                        clientBudget,
                        serverBudget,
                    );

                    if (resolution === 'client_won') {
                        await this.prisma.budget.update({
                            where: { id: clientBudget.id },
                            data: {
                                categoryId: clientBudget.categoryId,
                                amount: clientBudget.amount,
                                month: clientBudget.month,
                                isDeleted: clientBudget.isDeleted,
                                updatedAt: new Date(clientBudget.updatedAt),
                            },
                        });
                    } else {
                        conflicts.push(
                            new ConflictDto({
                                entityType: 'budget',
                                entityId: clientBudget.id,
                                clientVersion: clientBudget,
                                serverVersion: serverBudget,
                                resolution,
                                reason,
                            }),
                        );
                    }
                } else {
                    await this.prisma.budget.create({
                        data: {
                            id: clientBudget.id,
                            userId,
                            categoryId: clientBudget.categoryId,
                            amount: clientBudget.amount,
                            month: clientBudget.month,
                            isDeleted: clientBudget.isDeleted || false,
                            createdAt: new Date(clientBudget.createdAt),
                            updatedAt: new Date(clientBudget.updatedAt),
                        },
                    });
                }
            } catch (error) {
                this.logger.error(
                    `Error syncing budget ${clientBudget.id}: ${error.message}`,
                );
            }
        }

        return conflicts;
    }

    private async getServerChanges(
        entityType: 'account' | 'transaction' | 'budget',
        userId: string,
        lastSyncAt: Date,
    ): Promise<any[]> {
        const modelMap = {
            account: this.prisma.account,
            transaction: this.prisma.transaction,
            budget: this.prisma.budget,
        };

        const model = modelMap[entityType];

        return (model as any).findMany({
            where: {
                userId,
                updatedAt: {
                    gt: lastSyncAt,
                },
            },
            orderBy: {
                updatedAt: 'asc',
            },
        });
    }
}
