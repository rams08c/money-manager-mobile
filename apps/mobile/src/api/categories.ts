import { apiClient } from './client';
import { Category, CreateCategoryRequest, UpdateCategoryRequest } from './types';

/**
 * Categories API client
 * Handles all category-related API calls
 */
export const categoriesAPI = {
    /**
     * Get all categories for the authenticated user
     * @param type Optional filter by category type (INCOME or EXPENSE)
     * @returns Array of categories
     */
    getCategories: async (type?: 'INCOME' | 'EXPENSE'): Promise<Category[]> => {
        const params: any = { isDeleted: false };
        if (type) {
            params.type = type;
        }
        return apiClient.get<Category[]>('/categories', { params });
    },

    /**
     * Get a single category by ID
     * @param id Category ID
     * @returns Category object
     */
    getCategoryById: async (id: string): Promise<Category> => {
        return apiClient.get<Category>(`/categories/${id}`);
    },

    /**
     * Create a new category
     * @param data Category creation data
     * @returns Created category
     */
    createCategory: async (data: CreateCategoryRequest): Promise<Category> => {
        return apiClient.post<Category>('/categories', data);
    },

    /**
     * Update an existing category
     * @param id Category ID
     * @param data Category update data (name only)
     * @returns Updated category
     */
    updateCategory: async (id: string, data: UpdateCategoryRequest): Promise<Category> => {
        return apiClient.put<Category>(`/categories/${id}`, data);
    },

    /**
     * Delete a category (soft delete)
     * @param id Category ID
     */
    deleteCategory: async (id: string): Promise<void> => {
        await apiClient.delete(`/categories/${id}`);
    },
};
