/**
 * User model
 */
export interface User {
    id: string;
    email: string;
    name: string | null;
    defaultCurrency: string | null;
    createdAt: string;
    updatedAt: string;
}

/**
 * Auth response from backend
 */
export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
}

/**
 * Login request
 */
export interface LoginRequest {
    email: string;
    password: string;
}

/**
 * Register request
 */
export interface RegisterRequest {
    email: string;
    password: string;
    name?: string;
}

/**
 * Refresh token request
 */
export interface RefreshTokenRequest {
    refreshToken: string;
}

/**
 * Account model
 */
export interface Account {
    id: string;
    userId: string;
    name: string;
    type: 'CASH' | 'BANK' | 'WALLET' | 'CREDIT_CARD';
    currency: string;
    openingBalance: string;
    balance?: string; // Derived from backend
    createdAt: string;
}

/**
 * Transaction model
 */
export interface Transaction {
    id: string;
    userId: string;
    accountId: string;
    categoryId: string | null;
    type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
    amount: string;
    note: string | null;
    transactionDate: string;
    linkedTransactionId?: string | null;
    createdAt: string;
    updatedAt: string;
    // Populated fields from backend
    account?: Account;
    category?: {
        id: string;
        name: string;
        type: string;
    };
    linkedTransaction?: Transaction;
}

/**
 * Budget model
 */
export interface Budget {
    id: string;
    userId: string;
    categoryId: string;
    amount: string; // Budget limit
    month: string; // YYYY-MM format
    spent?: string; // Total spent (from backend)
    remaining?: string; // Remaining amount (from backend)
    percentage?: number; // Percentage used (from backend)
    category?: {
        id: string;
        name: string;
        type: string;
    };
}

/**
 * Category model
 */
export interface Category {
    id: string;
    userId: string;
    name: string;
    type: 'INCOME' | 'EXPENSE';
    createdAt: string;
    updatedAt: string;
    isDeleted: boolean;
}

/**
 * Create category request
 */
export interface CreateCategoryRequest {
    name: string;
    type: 'INCOME' | 'EXPENSE';
}

/**
 * Update category request
 */
export interface UpdateCategoryRequest {
    name: string;
}

/**
 * Report models
 */
export interface CategorySummary {
    categoryId: string;
    categoryName: string;
    totalAmount: number;
    transactionCount: number;
    percentage: number;
}

export interface AccountBalance {
    accountId: string;
    accountName: string;
    openingBalance: number;
    closingBalance: number;
    change: number;
}

export interface MonthlySummary {
    month: string;
    totalIncome: number;
    totalExpenses: number;
    netIncome: number;
    incomeCount: number;
    expenseCount: number;
    topCategories: CategorySummary[];
    accountBalances: AccountBalance[];
}

export interface CategoryBreakdown {
    categoryId: string;
    categoryName: string;
    totalAmount: number;
    transactionCount: number;
    percentage: number;
}

export interface BudgetVsActual {
    categoryId: string;
    categoryName: string;
    budgetAmount: number;
    actualAmount: number;
    difference: number;
    percentageUsed: number;
    status: 'under' | 'near' | 'over';
}

export interface BudgetAlert {
    categoryId: string;
    categoryName: string;
    budgetAmount: number;
    actualAmount: number;
    percentageUsed: number;
    threshold: 80 | 100 | 'over';
    message: string;
}

export interface TransactionResponse {
    transaction: Transaction;
    budgetAlerts?: BudgetAlert[];
}
