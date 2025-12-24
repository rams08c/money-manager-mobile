export class CategoryResponseDto {
    id: string;
    name: string;
    type: 'INCOME' | 'EXPENSE';
    userId: string | null;
    isSystem: boolean;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;

    constructor(partial: Partial<CategoryResponseDto>) {
        Object.assign(this, partial);
    }
}
