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

interface ExpensesState {
    expenses: Expense[];
    loading: boolean;
    error: string | null;
    lastFetched: number | null;
}

const initialState: ExpensesState = {
    expenses: [],
    loading: false,
    error: null,
    lastFetched: null,
};

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

const expensesSlice = createSlice({
    name: 'expenses',
    initialState,
    reducers: {
        clearExpensesError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
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
    },
});

export const { clearExpensesError } = expensesSlice.actions;
export default expensesSlice.reducer;
