import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
    MonthlySummaryDto,
    CategoryBreakdownDto,
    BudgetVsActualDto,
    CategorySummaryDto,
} from './dto';

@Injectable()
export class ReportsService {
    constructor(private prisma: PrismaService) { }

    async getMonthlySummary(
        userId: string,
        month: string,
        accountId?: string,
    ): Promise<MonthlySummaryDto> {
        const { start, end } = this.parseMonth(month);

        // Build where clause
        const where: any = {
            userId,
            transactionDate: { gte: start, lte: end },
            isDeleted: false,
        };

        if (accountId) {
            where.accountId = accountId;
        }

        // Parallel queries for performance
        const [incomeData, expenseData, topCategories] = await Promise.all([
            // Total income
            this.prisma.transaction.aggregate({
                where: { ...where, type: 'INCOME' },
                _sum: { amount: true },
                _count: { id: true },
            }),
            // Total expenses
            this.prisma.transaction.aggregate({
                where: { ...where, type: 'EXPENSE' },
                _sum: { amount: true },
                _count: { id: true },
            }),
            // Top 5 spending categories
            this.prisma.transaction.groupBy({
                by: ['categoryId'],
                where: { ...where, type: 'EXPENSE' },
                _sum: { amount: true },
                _count: { id: true },
                orderBy: { _sum: { amount: 'desc' } },
                take: 5,
            }),
        ]);

        const totalIncome = Number(incomeData._sum.amount || 0);
        const totalExpenses = Number(expenseData._sum.amount || 0);
        const expenseTotal = totalExpenses;

        // Get category names for top categories (filter out null categoryIds from transfers)
        const categoryIds = topCategories
            .map((c) => c.categoryId)
            .filter((id): id is string => id !== null);

        const categories = await this.prisma.category.findMany({
            where: { id: { in: categoryIds } },
            select: { id: true, name: true },
        });

        const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

        const topCategoriesDto: CategorySummaryDto[] = topCategories
            .filter((cat) => cat.categoryId !== null)
            .map((cat) => ({
                categoryId: cat.categoryId!,
                categoryName: categoryMap.get(cat.categoryId!) || 'Unknown',
                totalAmount: Number(cat._sum.amount || 0),
                transactionCount: cat._count.id,
                percentage:
                    expenseTotal > 0
                        ? (Number(cat._sum.amount || 0) / expenseTotal) * 100
                        : 0,
            }));

        return new MonthlySummaryDto({
            month,
            totalIncome,
            totalExpenses,
            netIncome: totalIncome - totalExpenses,
            incomeCount: incomeData._count.id,
            expenseCount: expenseData._count.id,
            topCategories: topCategoriesDto,
            accountBalances: [], // TODO: Implement if needed
        });
    }

    async getCategoryBreakdown(
        userId: string,
        startDate: string,
        endDate: string,
        type?: 'INCOME' | 'EXPENSE',
        categoryId?: string,
    ): Promise<CategoryBreakdownDto[]> {
        const start = new Date(startDate);
        const end = new Date(endDate);

        const where: any = {
            userId,
            transactionDate: { gte: start, lte: end },
            isDeleted: false,
        };

        if (type) {
            where.type = type;
        }

        if (categoryId) {
            where.categoryId = categoryId;
        }

        // Group by category
        const breakdown = await this.prisma.transaction.groupBy({
            by: ['categoryId'],
            where,
            _sum: { amount: true },
            _count: { id: true },
            orderBy: { _sum: { amount: 'desc' } },
        });

        // Calculate total for percentages
        const total = breakdown.reduce(
            (sum, item) => sum + Number(item._sum.amount || 0),
            0,
        );

        // Get category names (filter out null categoryIds from transfers)
        const categoryIds = breakdown
            .map((b) => b.categoryId)
            .filter((id): id is string => id !== null);

        const categories = await this.prisma.category.findMany({
            where: { id: { in: categoryIds } },
            select: { id: true, name: true },
        });

        const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

        return breakdown
            .filter((item) => item.categoryId !== null)
            .map(
                (item) =>
                    new CategoryBreakdownDto({
                        categoryId: item.categoryId!,
                        categoryName: categoryMap.get(item.categoryId!) || 'Unknown',
                        totalAmount: Number(item._sum.amount || 0),
                        transactionCount: item._count.id,
                        percentage: total > 0 ? (Number(item._sum.amount || 0) / total) * 100 : 0,
                    }),
            );
    }

    async getBudgetVsActual(
        userId: string,
        month: string,
    ): Promise<BudgetVsActualDto[]> {
        const { start, end } = this.parseMonth(month);

        // Get all budgets for the month
        const budgets = await this.prisma.budget.findMany({
            where: {
                userId,
                month,
                isDeleted: false,
            },
            include: {
                category: {
                    select: { name: true },
                },
            },
        });

        // Get actual spending for all categories
        const spending = await this.prisma.transaction.groupBy({
            by: ['categoryId'],
            where: {
                userId,
                type: 'EXPENSE',
                transactionDate: { gte: start, lte: end },
                isDeleted: false,
            },
            _sum: { amount: true },
        });

        const spendingMap = new Map(
            spending.map((s) => [s.categoryId, Number(s._sum.amount || 0)]),
        );

        return budgets.map((budget) => {
            const actualAmount = spendingMap.get(budget.categoryId) || 0;
            const budgetAmount = Number(budget.amount);
            const difference = budgetAmount - actualAmount;
            const percentageUsed =
                budgetAmount > 0 ? (actualAmount / budgetAmount) * 100 : 0;

            let status: 'under' | 'near' | 'over';
            if (percentageUsed >= 100) {
                status = 'over';
            } else if (percentageUsed >= 80) {
                status = 'near';
            } else {
                status = 'under';
            }

            return new BudgetVsActualDto({
                categoryId: budget.categoryId,
                categoryName: budget.category.name,
                budgetAmount,
                actualAmount,
                difference,
                percentageUsed,
                status,
            });
        });
    }

    // Helper method
    private parseMonth(month: string): { start: Date; end: Date } {
        const [year, monthNum] = month.split('-').map(Number);
        const start = new Date(year, monthNum - 1, 1, 0, 0, 0, 0);
        const end = new Date(year, monthNum, 0, 23, 59, 59, 999);
        return { start, end };
    }
}
