import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import type { AnalyticsData } from '../../types/analytics.types';

interface AnalyticsState {
    data: AnalyticsData | null;
    loading: boolean;
    error: string | null;
}

const initialState: AnalyticsState = {
    data: null,
    loading: false,
    error: null,
};

export interface FetchAnalyticsParams {
    startDate?: string;
    endDate?: string;
}

interface AxiosErrorResponse {
    response?: {
        data?: {
            error?: string;
        };
    };
}

export const fetchAnalytics = createAsyncThunk<AnalyticsData, FetchAnalyticsParams>(
    'analytics/fetchAnalytics',
    async (params: FetchAnalyticsParams = {}, { rejectWithValue }) => {
        try {
            const queryParams = new URLSearchParams();
            
            if (params.startDate) {
                queryParams.append('startDate', params.startDate);
            }
            if (params.endDate) {
                queryParams.append('endDate', params.endDate);
            }

            const url = `/analytics${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

            const response = await api.get<AnalyticsData>(url);

            return response.data;
        } catch (error) {
            const axiosError = error as AxiosErrorResponse;
            if (axiosError.response?.data?.error) {
                return rejectWithValue(axiosError.response.data.error);
            }
            return rejectWithValue('Failed to fetch analytics');
        }
    }
);

const analyticsSlice = createSlice({
    name: 'analytics',
    initialState,
    reducers: {
        clearAnalytics: (state) => {
            state.data = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAnalytics.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAnalytics.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchAnalytics.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearAnalytics } = analyticsSlice.actions;
export default analyticsSlice.reducer;
