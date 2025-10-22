import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';
import type { CreateExpenseData, Expense, FetchExpensesFilters, FetchExpensesResponse, PaginationMetadata } from '../../types/expenses.types';

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

export const fetchExpenses = createAsyncThunk<
    FetchExpensesResponse,
    FetchExpensesFilters | undefined,
    { rejectValue: string }
>(
    'expenses/fetchExpenses',
    async (filters = {}, { rejectWithValue }) => {
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
        } catch (error) {
            const errorMessage = error && typeof error === 'object' && 'response' in error &&
                error.response && typeof error.response === 'object' && 'data' in error.response &&
                error.response.data && typeof error.response.data === 'object' && 'error' in error.response.data
                ? String(error.response.data.error)
                : 'Failed to fetch expenses';
            return rejectWithValue(errorMessage);
        }
    }
);

export const createExpense = createAsyncThunk<
    Expense,
    CreateExpenseData,
    { rejectValue: string }
>(
    'expenses/createExpense',
    async (data, { rejectWithValue }) => {
        try {
            const response = await api.post<Expense>('/expenses', data);
            return response.data;
        } catch (error) {
            const errorMessage = error && typeof error === 'object' && 'response' in error &&
                error.response && typeof error.response === 'object' && 'data' in error.response &&
                error.response.data && typeof error.response.data === 'object' && 'error' in error.response.data
                ? String(error.response.data.error)
                : 'Failed to create expense';
            return rejectWithValue(errorMessage);
        }
    }
);

export const updateExpense = createAsyncThunk<
    Expense,
    { id: string; data: CreateExpenseData },
    { rejectValue: string }
>(
    'expenses/updateExpense',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await api.patch<Expense>(`/expenses/${id}`, data);
            return response.data;
        } catch (error) {
            const errorMessage = error && typeof error === 'object' && 'response' in error &&
                error.response && typeof error.response === 'object' && 'data' in error.response &&
                error.response.data && typeof error.response.data === 'object' && 'error' in error.response.data
                ? String(error.response.data.error)
                : 'Failed to update expense';
            return rejectWithValue(errorMessage);
        }
    }
);

export const approveExpense = createAsyncThunk<
    Expense,
    string,
    { rejectValue: string }
>(
    'expenses/approveExpense',
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.patch<Expense>(`/expenses/${id}/approve`);
            return response.data;
        } catch (error) {
            const errorMessage = error && typeof error === 'object' && 'response' in error &&
                error.response && typeof error.response === 'object' && 'data' in error.response &&
                error.response.data && typeof error.response.data === 'object' && 'error' in error.response.data
                ? String(error.response.data.error)
                : 'Failed to approve expense';
            return rejectWithValue(errorMessage);
        }
    }
);

export const rejectExpense = createAsyncThunk<
    Expense,
    { id: string; rejectionReason: string },
    { rejectValue: string }
>(
    'expenses/rejectExpense',
    async ({ id, rejectionReason }, { rejectWithValue }) => {
        try {
            const response = await api.patch<Expense>(`/expenses/${id}/reject`, { rejectionReason });
            return response.data;
        } catch (error) {
            const errorMessage = error && typeof error === 'object' && 'response' in error &&
                error.response && typeof error.response === 'object' && 'data' in error.response &&
                error.response.data && typeof error.response.data === 'object' && 'error' in error.response.data
                ? String(error.response.data.error)
                : 'Failed to reject expense';
            return rejectWithValue(errorMessage);
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
        clearExpenses: (state) => {
            state.expenses = [];
            state.pagination = null;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchExpenses.pending, (state) => {
            state.loading = true;
            state.error = null;
            state.expenses = [];
            state.pagination = null;
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

        builder.addCase(approveExpense.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(approveExpense.fulfilled, (state, action: PayloadAction<Expense>) => {
            state.loading = false;
            const index = state.expenses.findIndex(e => e.id === action.payload.id);
            if (index !== -1) {
                state.expenses[index] = action.payload;
            }
        });
        builder.addCase(approveExpense.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        builder.addCase(rejectExpense.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(rejectExpense.fulfilled, (state, action: PayloadAction<Expense>) => {
            state.loading = false;
            // Update the expense in the list
            const index = state.expenses.findIndex(e => e.id === action.payload.id);
            if (index !== -1) {
                state.expenses[index] = action.payload;
            }
        });
        builder.addCase(rejectExpense.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });
    },
});

export const { clearExpensesError, clearExpenses } = expensesSlice.actions;
export default expensesSlice.reducer;
