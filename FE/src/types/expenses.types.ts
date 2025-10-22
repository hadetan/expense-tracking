import type { Category } from "../store/slices/categoriesSlice";


export type ExpenseStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Expense {
    id: string;
    userId: string;
    amount: string;
    categoryId: string;
    category?: Category;
    user?: {
        id: string;
        email: string;
        name: string | null;
    };
    description: string;
    date: string;
    status: ExpenseStatus;
    rejectionReason: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateExpenseData {
    amount: number;
    categoryId: string;
    description: string;
    date: string;
}

export interface FetchExpensesFilters {
    status?: string;
    categoryId?: string;
    startDate?: string;
    endDate?: string;
    dateFilter?: 'today' | 'week' | 'month' | 'custom' | 'all';
    page?: number;
    limit?: number;
}

export interface PaginationMetadata {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export interface FetchExpensesResponse {
    expenses: Expense[];
    pagination: PaginationMetadata;
}
