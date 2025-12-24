import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
    CreateBudgetDto,
    UpdateBudgetDto,
    BudgetResponseDto,
    BudgetWithSpendingDto,
} from './dto';
import {
    BudgetNotFoundException,
    BudgetAlreadyExistsException,
} from './exceptions';
import { InvalidAmountException } from '../transactions/exceptions';

@Injectable()
export class BudgetsService {
    constructor(private prisma: PrismaService) { }

    async create(
        userId: string,
        createBudgetDto: CreateBudgetDto,
    ): Promise<BudgetResponseDto> {
        // Validate amount
        if (createBudgetDto.amount <= 0) {
            throw new InvalidAmountException();
        }

        // Check if budget already exists for this category and month
        const existingBudget = await this.prisma.budget.findFirst({
            where: {
                userId,
                categoryId: createBudgetDto.categoryId,
                month: createBudgetDto.month,
            },
        });

        if (existingBudget) {
            throw new BudgetAlreadyExistsException();
        }

        // Create budget
        const budget = await this.prisma.budget.create({
            data: {
                userId,
                categoryId: createBudgetDto.categoryId,
                amount: createBudgetDto.amount,
                month: createBudgetDto.month,
            },
        });

        return this.mapToResponseDto(budget);
    }

    async findAll(
        userId: string,
        month?: string,
    ): Promise<BudgetWithSpendingDto[]> {
        const budgets = await this.prisma.budget.findMany({
            where: {
                userId,
                ...(month && { month }),
            },
            orderBy: { month: 'desc' },
        });

        // Calculate spending for each budget
        const budgetsWithSpending = await Promise.all(
            budgets.map(async (budget) => {
                const spent = await this.calculateSpending(
                    userId,
                    budget.categoryId,
                    budget.month,
                );
                return new BudgetWithSpendingDto(
                    this.mapToResponseDto(budget),
                    spent,
                );
            }),
        );

        return budgetsWithSpending;
    }

    async findOne(
        userId: string,
        budgetId: string,
    ): Promise<BudgetWithSpendingDto> {
        const budget = await this.validateUserOwnership(userId, budgetId);

        const spent = await this.calculateSpending(
            userId,
            budget.categoryId,
            budget.month,
        );

        return new BudgetWithSpendingDto(this.mapToResponseDto(budget), spent);
    }

    async update(
        userId: string,
        budgetId: string,
        updateBudgetDto: UpdateBudgetDto,
    ): Promise<BudgetResponseDto> {
        await this.validateUserOwnership(userId, budgetId);

        // Validate amount if provided
        if (
            updateBudgetDto.amount !== undefined &&
            updateBudgetDto.amount <= 0
        ) {
            throw new InvalidAmountException();
        }

        const updatedBudget = await this.prisma.budget.update({
            where: { id: budgetId },
            data: updateBudgetDto,
        });

        return this.mapToResponseDto(updatedBudget);
    }

    async remove(userId: string, budgetId: string): Promise<void> {
        await this.validateUserOwnership(userId, budgetId);

        await this.prisma.budget.delete({
            where: { id: budgetId },
        });
    }

    // Private helper methods

    private async validateUserOwnership(
        userId: string,
        budgetId: string,
    ): Promise<any> {
        const budget = await this.prisma.budget.findFirst({
            where: {
                id: budgetId,
                userId: userId,
            },
        });

        if (!budget) {
            throw new BudgetNotFoundException();
        }

        return budget;
    }

    private async calculateSpending(
        userId: string,
        categoryId: string,
        month: string,
    ): Promise<number> {
        // Parse month to get start and end dates
        const { start, end } = this.parseMonth(month);

        // Sum EXPENSE transactions for this category in this month
        const result = await this.prisma.transaction.aggregate({
            where: {
                userId,
                categoryId,
                type: 'EXPENSE',
                transactionDate: {
                    gte: start,
                    lte: end,
                },
            },
            _sum: {
                amount: true,
            },
        });

        return Number(result._sum.amount || 0);
    }

    private parseMonth(month: string): { start: Date; end: Date } {
        const [year, monthNum] = month.split('-').map(Number);

        // First day of month at 00:00:00
        const start = new Date(year, monthNum - 1, 1, 0, 0, 0, 0);

        // Last day of month at 23:59:59.999
        const end = new Date(year, monthNum, 0, 23, 59, 59, 999);

        return { start, end };
    }

    private mapToResponseDto(budget: any): BudgetResponseDto {
        return new BudgetResponseDto({
            id: budget.id,
            userId: budget.userId,
            categoryId: budget.categoryId,
            amount: Number(budget.amount),
            month: budget.month,
            createdAt: budget.createdAt,
            updatedAt: budget.updatedAt,
        });
    }
}
