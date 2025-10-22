import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';

export interface Category {
    id: string;
    name: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

interface CategoriesState {
    categories: Category[];
    loading: boolean;
    error: string | null;
    lastFetched: number | null;
}

const initialState: CategoriesState = {
    categories: [],
    loading: false,
    error: null,
    lastFetched: null,
};

export const fetchCategories = createAsyncThunk<
    Category[],
    void,
    { rejectValue: string }
>(
    'categories/fetchCategories',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get<Category[]>('/categories');
            return response.data;
        } catch (error) {
            const errorMessage = error && typeof error === 'object' && 'response' in error &&
                error.response && typeof error.response === 'object' && 'data' in error.response &&
                error.response.data && typeof error.response.data === 'object' && 'error' in error.response.data
                ? String(error.response.data.error)
                : 'Failed to fetch categories';
            return rejectWithValue(errorMessage);
        }
    }
);

export const createCategory = createAsyncThunk<
    Category,
    string,
    { rejectValue: string }
>(
    'categories/createCategory',
    async (name, { rejectWithValue }) => {
        try {
            const response = await api.post<Category>('/categories', { name });
            return response.data;
        } catch (error) {
            const errorMessage = error && typeof error === 'object' && 'response' in error &&
                error.response && typeof error.response === 'object' && 'data' in error.response &&
                error.response.data && typeof error.response.data === 'object' && 'error' in error.response.data
                ? String(error.response.data.error)
                : 'Failed to create category';
            return rejectWithValue(errorMessage);
        }
    }
);

const categoriesSlice = createSlice({
    name: 'categories',
    initialState,
    reducers: {
        clearCategoriesError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchCategories.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchCategories.fulfilled, (state, action: PayloadAction<Category[]>) => {
            state.loading = false;
            state.categories = action.payload;
            state.lastFetched = Date.now();
        });
        builder.addCase(fetchCategories.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        builder.addCase(createCategory.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(createCategory.fulfilled, (state, action: PayloadAction<Category>) => {
            state.loading = false;
            state.categories.push(action.payload);
            // Sort categories alphabetically after adding new one
            state.categories.sort((a, b) => a.name.localeCompare(b.name));
        });
        builder.addCase(createCategory.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });
    },
});

export const { clearCategoriesError } = categoriesSlice.actions;
export default categoriesSlice.reducer;
