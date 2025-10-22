import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';
import type { Category } from './categoriesSlice';

export type ExpenseStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Expense {
    id: string;
    userId: string;
    amount: string;
    categoryId: string;
    category?: Category;
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

interface ExpensesState {
    expenses: Expense[];
    loading: boolean;
    error: string | null;
    lastFetched: number | null;
    pagination: PaginationMetadata | null;
}

const initialState: ExpensesState = {
    expenses: [],
    loading: false,
    error: null,
    lastFetched: null,
    pagination: null,
};

export const fetchExpenses = createAsyncThunk(
    'expenses/fetchExpenses',
    async (filters: FetchExpensesFilters = {}, { rejectWithValue }) => {
        try {
            const params = new URLSearchParams();
            if (filters.status) params.append('status', filters.status);
            if (filters.categoryId) params.append('categoryId', filters.categoryId);
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);
            if (filters.dateFilter) params.append('dateFilter', filters.dateFilter);
            if (filters.page) params.append('page', filters.page.toString());
            if (filters.limit) params.append('limit', filters.limit.toString());

            const response = await api.get<FetchExpensesResponse>(`/expenses?${params.toString()}`);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch expenses');
        }
    }
);

export const createExpense = createAsyncThunk(
    'expenses/createExpense',
    async (data: CreateExpenseData, { rejectWithValue }) => {
        try {
            const response = await api.post<Expense>('/expenses', data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to create expense');
        }
    }
);

export const updateExpense = createAsyncThunk(
    'expenses/updateExpense',
    async ({ id, data }: { id: string; data: CreateExpenseData }, { rejectWithValue }) => {
        try {
            const response = await api.patch<Expense>(`/expenses/${id}`, data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to update expense');
        }
    }
);

const expensesSlice = createSlice({
    name: 'expenses',
    initialState,
    reducers: {
        clearExpensesError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchExpenses.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchExpenses.fulfilled, (state, action: PayloadAction<FetchExpensesResponse>) => {
            state.loading = false;
            state.expenses = action.payload.expenses;
            state.pagination = action.payload.pagination;
            state.lastFetched = Date.now();
        });
        builder.addCase(fetchExpenses.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        builder.addCase(createExpense.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(createExpense.fulfilled, (state, action: PayloadAction<Expense>) => {
            state.loading = false;
            state.expenses.unshift(action.payload); /* Most recent first */
        });
        builder.addCase(createExpense.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        builder.addCase(updateExpense.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(updateExpense.fulfilled, (state, action: PayloadAction<Expense>) => {
            state.loading = false;
            const index = state.expenses.findIndex(e => e.id === action.payload.id);
            if (index !== -1) {
                state.expenses[index] = action.payload;
            }
        });
        builder.addCase(updateExpense.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });
    },
});

export const { clearExpensesError } = expensesSlice.actions;
export default expensesSlice.reducer;
