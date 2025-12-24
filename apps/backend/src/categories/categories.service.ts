import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
    CreateCategoryDto,
    UpdateCategoryDto,
    CategoryResponseDto,
    CategoryQueryDto,
} from './dto';
import {
    CategoryNotFoundException,
    CategoryIsSystemException,
    CategoryInUseException,
    DuplicateCategoryNameException,
} from './exceptions';

@Injectable()
export class CategoriesService {
    constructor(private prisma: PrismaService) { }

    async create(
        userId: string,
        createCategoryDto: CreateCategoryDto,
    ): Promise<CategoryResponseDto> {
        // Trim and validate name
        const name = createCategoryDto.name.trim();

        // Check name uniqueness for this user and type
        await this.checkNameUniqueness(
            userId,
            name,
            createCategoryDto.type,
        );

        // Create user category
        const category = await this.prisma.category.create({
            data: {
                userId,
                name,
                type: createCategoryDto.type,
                isSystem: false,
                isDeleted: false,
            },
        });

        return this.mapToResponseDto(category);
    }

    async findAll(
        userId: string,
        query: CategoryQueryDto,
    ): Promise<CategoryResponseDto[]> {
        // Query system categories
        const systemCategories = await this.prisma.category.findMany({
            where: {
                isSystem: true,
                isDeleted: false,
                ...(query.type && { type: query.type }),
            },
            orderBy: { name: 'asc' },
        });

        // Query user categories
        const userCategories = await this.prisma.category.findMany({
            where: {
                userId,
                isSystem: false,
                isDeleted: query.isDeleted || false,
                ...(query.type && { type: query.type }),
            },
            orderBy: { name: 'asc' },
        });

        // Combine: system first, then user
        const allCategories = [...systemCategories, ...userCategories];

        return allCategories.map((cat) => this.mapToResponseDto(cat));
    }

    async findOne(
        userId: string,
        categoryId: string,
    ): Promise<CategoryResponseDto> {
        const category = await this.prisma.category.findFirst({
            where: {
                id: categoryId,
            },
        });

        if (!category) {
            throw new CategoryNotFoundException();
        }

        // System categories are accessible to all
        if (category.isSystem) {
            return this.mapToResponseDto(category);
        }

        // User categories must belong to the user
        if (category.userId !== userId) {
            throw new CategoryNotFoundException();
        }

        return this.mapToResponseDto(category);
    }

    async update(
        userId: string,
        categoryId: string,
        updateCategoryDto: UpdateCategoryDto,
    ): Promise<CategoryResponseDto> {
        // Validate user ownership and not system
        const category = await this.validateUserOwnership(userId, categoryId);

        // If name is being updated, check uniqueness
        if (updateCategoryDto.name) {
            const name = updateCategoryDto.name.trim();
            await this.checkNameUniqueness(
                userId,
                name,
                category.type,
                categoryId,
            );

            // Update category
            const updatedCategory = await this.prisma.category.update({
                where: { id: categoryId },
                data: { name },
            });

            return this.mapToResponseDto(updatedCategory);
        }

        // No changes
        return this.mapToResponseDto(category);
    }

    async remove(userId: string, categoryId: string): Promise<void> {
        // Validate user ownership and not system
        await this.validateUserOwnership(userId, categoryId);

        // Check if category is in use
        const inUse = await this.checkCategoryInUse(categoryId);
        if (inUse) {
            throw new CategoryInUseException();
        }

        // Soft delete
        await this.prisma.category.update({
            where: { id: categoryId },
            data: { isDeleted: true },
        });
    }

    // Private helper methods

    private async validateUserOwnership(
        userId: string,
        categoryId: string,
    ): Promise<any> {
        const category = await this.prisma.category.findFirst({
            where: {
                id: categoryId,
            },
        });

        if (!category) {
            throw new CategoryNotFoundException();
        }

        // Cannot modify system categories
        if (category.isSystem) {
            throw new CategoryIsSystemException();
        }

        // Must be owned by user
        if (category.userId !== userId) {
            throw new CategoryNotFoundException();
        }

        return category;
    }

    private async checkCategoryInUse(categoryId: string): Promise<boolean> {
        // Check for active transactions
        const transactionCount = await this.prisma.transaction.count({
            where: {
                categoryId,
                // Don't count deleted transactions
            },
        });

        if (transactionCount > 0) {
            return true;
        }

        // Check for budgets (any month)
        const budgetCount = await this.prisma.budget.count({
            where: {
                categoryId,
            },
        });

        if (budgetCount > 0) {
            return true;
        }

        return false;
    }

    private async checkNameUniqueness(
        userId: string,
        name: string,
        type: 'INCOME' | 'EXPENSE',
        excludeId?: string,
    ): Promise<void> {
        const existingCategory = await this.prisma.category.findFirst({
            where: {
                userId,
                name: {
                    equals: name,
                    mode: 'insensitive', // Case-insensitive
                },
                type,
                isDeleted: false,
                ...(excludeId && { id: { not: excludeId } }),
            },
        });

        if (existingCategory) {
            throw new DuplicateCategoryNameException();
        }
    }

    private mapToResponseDto(category: any): CategoryResponseDto {
        return new CategoryResponseDto({
            id: category.id,
            name: category.name,
            type: category.type,
            userId: category.userId,
            isSystem: category.isSystem,
            isDeleted: category.isDeleted,
            createdAt: category.createdAt,
            updatedAt: category.updatedAt,
        });
    }
}
