import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
    CreateTransactionDto,
    CreateTransferDto,
    UpdateTransactionDto,
    TransactionResponseDto,
    TransferResponseDto,
} from './dto';
import { TransactionType } from './enums';
import {
    TransactionNotFoundException,
    InvalidAmountException,
    TransferCannotBeModifiedException,
} from './exceptions';
import { AccountNotFoundException } from '../accounts/exceptions';

@Injectable()
export class TransactionsService {
    constructor(private prisma: PrismaService) { }

    async create(
        userId: string,
        createTransactionDto: CreateTransactionDto,
    ): Promise<TransactionResponseDto> {
        // If it's a TRANSFER, delegate to createTransfer
        if (createTransactionDto.type === TransactionType.TRANSFER) {
            if (!createTransactionDto.toAccountId) {
                throw new Error('toAccountId is required for TRANSFER transactions');
            }

            const transferDto = {
                fromAccountId: createTransactionDto.accountId,
                toAccountId: createTransactionDto.toAccountId,
                amount: createTransactionDto.amount,
                note: createTransactionDto.note,
                transactionDate: createTransactionDto.transactionDate,
            };

            const transferResponse = await this.createTransfer(userId, transferDto);
            // Return the first transaction (debit) as the primary response
            return transferResponse.fromTransaction;
        }

        // Validate amount
        if (createTransactionDto.amount <= 0) {
            throw new InvalidAmountException();
        }

        // Validate account belongs to user
        const account = await this.prisma.account.findFirst({
            where: {
                id: createTransactionDto.accountId,
                userId: userId,
            },
        });

        if (!account) {
            throw new AccountNotFoundException();
        }

        // Create transaction
        const transaction = await this.prisma.transaction.create({
            data: {
                userId,
                accountId: createTransactionDto.accountId,
                categoryId: createTransactionDto.categoryId || null,
                type: createTransactionDto.type,
                amount: createTransactionDto.amount,
                note: createTransactionDto.note || null,
                transactionDate: createTransactionDto.transactionDate
                    ? new Date(createTransactionDto.transactionDate)
                    : new Date(),
            },
            include: {
                account: true,
                category: true,
            },
        });

        return this.mapToResponseDto(transaction);
    }

    async createTransfer(
        userId: string,
        createTransferDto: CreateTransferDto,
    ): Promise<TransferResponseDto> {
        // Validate amount
        if (createTransferDto.amount <= 0) {
            throw new InvalidAmountException();
        }

        // Validate both accounts belong to user
        const [fromAccount, toAccount] = await Promise.all([
            this.prisma.account.findFirst({
                where: { id: createTransferDto.fromAccountId, userId },
            }),
            this.prisma.account.findFirst({
                where: { id: createTransferDto.toAccountId, userId },
            }),
        ]);

        if (!fromAccount || !toAccount) {
            throw new AccountNotFoundException();
        }

        // Create TRANSFER atomically using Prisma transaction
        const result = await this.prisma.$transaction(async (tx) => {
            const transactionDate = createTransferDto.transactionDate
                ? new Date(createTransferDto.transactionDate)
                : new Date();

            // Create debit transaction (source account)
            const debitTx = await tx.transaction.create({
                data: {
                    userId,
                    accountId: createTransferDto.fromAccountId,
                    categoryId: null, // Transfers don't need categories
                    type: TransactionType.TRANSFER,
                    amount: -Math.abs(createTransferDto.amount), // Negative for debit
                    note:
                        createTransferDto.note ||
                        `Transfer to ${toAccount.name}`,
                    transactionDate,
                },
            });

            // Create credit transaction (destination account)
            const creditTx = await tx.transaction.create({
                data: {
                    userId,
                    accountId: createTransferDto.toAccountId,
                    categoryId: null, // Transfers don't need categories
                    type: TransactionType.TRANSFER,
                    amount: Math.abs(createTransferDto.amount), // Positive for credit
                    note:
                        createTransferDto.note ||
                        `Transfer from ${fromAccount.name}`,
                    transactionDate,
                },
            });

            // Link both transactions
            await tx.transaction.update({
                where: { id: debitTx.id },
                data: { linkedTransactionId: creditTx.id },
            });

            await tx.transaction.update({
                where: { id: creditTx.id },
                data: { linkedTransactionId: debitTx.id },
            });

            return { debitTx, creditTx };
        });

        // Map to response DTOs
        const fromTxDto = this.mapToResponseDto(result.debitTx);
        const toTxDto = this.mapToResponseDto(result.creditTx);

        return new TransferResponseDto(fromTxDto, toTxDto);
    }

    async findAll(
        userId: string,
        filters?: {
            accountId?: string;
            type?: string;
            startDate?: string;
            endDate?: string;
        },
    ): Promise<TransactionResponseDto[]> {
        // Build where clause
        const where: any = { userId };

        if (filters?.accountId) {
            where.accountId = filters.accountId;
        }

        if (filters?.type) {
            where.type = filters.type;
        }

        if (filters?.startDate || filters?.endDate) {
            where.transactionDate = {};
            if (filters.startDate) {
                where.transactionDate.gte = new Date(filters.startDate);
            }
            if (filters.endDate) {
                where.transactionDate.lte = new Date(filters.endDate);
            }
        }

        const transactions = await this.prisma.transaction.findMany({
            where,
            orderBy: { transactionDate: 'desc' },
            include: {
                account: true,
                category: true,
                linkedTransaction: {
                    include: {
                        account: true,
                    },
                },
            },
        });

        return transactions.map((tx) => this.mapToResponseDto(tx));
    }

    async findOne(
        userId: string,
        transactionId: string,
    ): Promise<TransactionResponseDto> {
        const transaction = await this.validateUserOwnership(userId, transactionId);
        return this.mapToResponseDto(transaction);
    }

    async update(
        userId: string,
        transactionId: string,
        updateTransactionDto: UpdateTransactionDto,
    ): Promise<TransactionResponseDto> {
        const transaction = await this.validateUserOwnership(userId, transactionId);

        // Block updates to TRANSFER transactions
        if (transaction.type === TransactionType.TRANSFER) {
            throw new TransferCannotBeModifiedException();
        }

        // Validate amount if provided
        if (
            updateTransactionDto.amount !== undefined &&
            updateTransactionDto.amount <= 0
        ) {
            throw new InvalidAmountException();
        }

        // Update transaction
        const updatedTransaction = await this.prisma.transaction.update({
            where: { id: transactionId },
            data: {
                ...updateTransactionDto,
                transactionDate: updateTransactionDto.transactionDate
                    ? new Date(updateTransactionDto.transactionDate)
                    : undefined,
            },
        });

        return this.mapToResponseDto(updatedTransaction);
    }

    async remove(userId: string, transactionId: string): Promise<void> {
        const transaction = await this.validateUserOwnership(userId, transactionId);

        if (transaction.type === TransactionType.TRANSFER) {
            // Delete both linked transactions atomically
            await this.prisma.$transaction([
                this.prisma.transaction.delete({ where: { id: transaction.id } }),
                this.prisma.transaction.delete({
                    where: { id: transaction.linkedTransactionId },
                }),
            ]);
        } else {
            // Delete single transaction
            await this.prisma.transaction.delete({ where: { id: transactionId } });
        }
    }

    // Private helper methods

    private async validateUserOwnership(
        userId: string,
        transactionId: string,
    ): Promise<any> {
        const transaction = await this.prisma.transaction.findFirst({
            where: {
                id: transactionId,
                userId: userId,
            },
            include: {
                account: true,
                category: true,
                linkedTransaction: {
                    include: {
                        account: true,
                    },
                },
            },
        });

        if (!transaction) {
            throw new TransactionNotFoundException();
        }

        return transaction;
    }

    private mapToResponseDto(transaction: any): TransactionResponseDto {
        return new TransactionResponseDto({
            id: transaction.id,
            userId: transaction.userId,
            accountId: transaction.accountId,
            categoryId: transaction.categoryId,
            type: transaction.type,
            amount: Number(transaction.amount),
            note: transaction.note,
            transactionDate: transaction.transactionDate,
            linkedTransactionId: transaction.linkedTransactionId,
            createdAt: transaction.createdAt,
            updatedAt: transaction.updatedAt,
            // Include related data if available
            account: transaction.account,
            category: transaction.category,
            linkedTransaction: transaction.linkedTransaction,
        });
    }
}
