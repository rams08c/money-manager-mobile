import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
    CreateAccountDto,
    UpdateAccountDto,
    AccountResponseDto,
    AccountWithBalanceDto,
} from './dto';
import { AccountNotFoundException } from './exceptions';
import { CurrencyChangeNotAllowedException } from '../users/exceptions';

@Injectable()
export class AccountsService {
    constructor(private prisma: PrismaService) { }

    async create(
        userId: string,
        createAccountDto: CreateAccountDto,
    ): Promise<AccountResponseDto> {
        const account = await this.prisma.account.create({
            data: {
                userId,
                name: createAccountDto.name,
                type: createAccountDto.type,
                currency: createAccountDto.currency,
                openingBalance: createAccountDto.openingBalance,
            },
        });

        return this.mapToResponseDto(account);
    }

    async findAll(userId: string): Promise<AccountWithBalanceDto[]> {
        const accounts = await this.prisma.account.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });

        // Calculate balance for each account
        const accountsWithBalance = await Promise.all(
            accounts.map(async (account) => {
                const balance = await this.calculateBalance(account.id);
                return this.mapToBalanceDto(account, balance);
            }),
        );

        return accountsWithBalance;
    }

    async findOne(
        userId: string,
        accountId: string,
    ): Promise<AccountWithBalanceDto> {
        const account = await this.validateUserOwnership(userId, accountId);
        const balance = await this.calculateBalance(accountId);
        return this.mapToBalanceDto(account, balance);
    }

    async update(
        userId: string,
        accountId: string,
        updateAccountDto: UpdateAccountDto,
    ): Promise<AccountResponseDto> {
        const account = await this.validateUserOwnership(userId, accountId);

        // Enforce currency immutability
        // Note: UpdateAccountDto doesn't include currency field, but double-check
        // in case someone tries to pass it through
        if ('currency' in updateAccountDto) {
            throw new CurrencyChangeNotAllowedException();
        }

        const updatedAccount = await this.prisma.account.update({
            where: { id: accountId },
            data: updateAccountDto,
        });

        return this.mapToResponseDto(updatedAccount);
    }

    async remove(userId: string, accountId: string): Promise<void> {
        await this.validateUserOwnership(userId, accountId);

        await this.prisma.account.delete({
            where: { id: accountId },
        });
    }

    // Private helper methods

    private async validateUserOwnership(
        userId: string,
        accountId: string,
    ): Promise<any> {
        const account = await this.prisma.account.findFirst({
            where: {
                id: accountId,
                userId: userId,
            },
        });

        if (!account) {
            throw new AccountNotFoundException();
        }

        return account;
    }

    private async calculateBalance(accountId: string): Promise<number> {
        // Get account's opening balance
        const account = await this.prisma.account.findUnique({
            where: { id: accountId },
            select: { openingBalance: true },
        });

        if (!account) {
            return 0;
        }

        // Calculate sum of transactions
        // Note: This assumes Transaction model exists with accountId field
        // Formula: balance = openingBalance + SUM(transactions.amount)
        const transactionSum = await this.prisma.transaction.aggregate({
            where: { accountId },
            _sum: { amount: true },
        });

        const openingBalance = Number(account.openingBalance);
        const transactionTotal = Number(transactionSum._sum.amount || 0);

        return openingBalance + transactionTotal;
    }

    private mapToResponseDto(account: any): AccountResponseDto {
        return new AccountResponseDto({
            id: account.id,
            userId: account.userId,
            name: account.name,
            type: account.type,
            currency: account.currency,
            openingBalance: Number(account.openingBalance),
            createdAt: account.createdAt,
        });
    }

    private mapToBalanceDto(
        account: any,
        balance: number,
    ): AccountWithBalanceDto {
        return new AccountWithBalanceDto({
            id: account.id,
            userId: account.userId,
            name: account.name,
            type: account.type,
            currency: account.currency,
            openingBalance: Number(account.openingBalance),
            createdAt: account.createdAt,
            balance: balance,
        });
    }
}
