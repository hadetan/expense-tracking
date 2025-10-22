import { describe, it, expect, jest } from '@jest/globals';

jest.mock('../../services/api', () => ({
    default: {
        post: jest.fn(),
        get: jest.fn(),
    },
    setAuthToken: jest.fn(),
}));

import authReducer, { clearError, clearAuth } from '../../store/slices/authSlice';

interface AuthState {
    user: {
        id: string;
        email: string;
        name: string | null;
        role: 'employee' | 'admin';
    } | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

describe('authSlice', () => {
    const initialState: AuthState = {
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
    };

    it('should handle initial state', () => {
        expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    it('should handle clearError action', () => {
        const stateWithError: AuthState = {
            ...initialState,
            error: 'Some error occurred',
        };

        const state = authReducer(stateWithError, clearError());

        expect(state.error).toBeNull();
        expect(state.user).toBeNull();
        expect(state.accessToken).toBeNull();
    });

    it('should handle clearAuth action', () => {
        const loggedInState: AuthState = {
            user: {
                id: '123',
                email: 'test@example.com',
                name: 'Test User',
                role: 'employee',
            },
            accessToken: 'mock-token',
            isAuthenticated: true,
            isLoading: false,
            error: null,
        };

        const state = authReducer(loggedInState, clearAuth());

        expect(state.user).toBeNull();
        expect(state.accessToken).toBeNull();
        expect(state.isAuthenticated).toBe(false);
        expect(state.error).toBeNull();
    });

    it('should handle login.pending action', () => {
        const state = authReducer(initialState, {
            type: 'auth/login/pending',
        });

        expect(state.isLoading).toBe(true);
        expect(state.error).toBeNull();
    });

    it('should handle login.fulfilled action', () => {
        const mockPayload = {
            user: {
                id: '123',
                email: 'test@example.com',
                name: 'Test User',
                role: 'employee' as const,
            },
            accessToken: 'mock-access-token',
        };

        const state = authReducer(initialState, {
            type: 'auth/login/fulfilled',
            payload: mockPayload,
        });

        expect(state.isLoading).toBe(false);
        expect(state.isAuthenticated).toBe(true);
        expect(state.user).toEqual(mockPayload.user);
        expect(state.accessToken).toBe('mock-access-token');
        expect(state.error).toBeNull();
    });

    it('should handle login.rejected action', () => {
        const state = authReducer(initialState, {
            type: 'auth/login/rejected',
            payload: 'Invalid credentials',
        });

        expect(state.isLoading).toBe(false);
        expect(state.error).toBe('Invalid credentials');
        expect(state.isAuthenticated).toBe(false);
    });

    it('should handle logout.fulfilled action', () => {
        const loggedInState: AuthState = {
            user: {
                id: '123',
                email: 'test@example.com',
                name: 'Test User',
                role: 'employee',
            },
            accessToken: 'mock-token',
            isAuthenticated: true,
            isLoading: false,
            error: null,
        };

        const state = authReducer(loggedInState, {
            type: 'auth/logout/fulfilled',
        });

        expect(state.user).toBeNull();
        expect(state.accessToken).toBeNull();
        expect(state.isAuthenticated).toBe(false);
        expect(state.isLoading).toBe(false);
        expect(state.error).toBeNull();
    });

    it('should preserve loading state correctly', () => {
        const loadingState: AuthState = {
            ...initialState,
            isLoading: true,
        };

        const state = authReducer(loadingState, clearError());

        expect(state.isLoading).toBe(true);
    });

    it('should handle admin role correctly', () => {
        const mockPayload = {
            user: {
                id: '999',
                email: 'admin@example.com',
                name: 'Admin User',
                role: 'admin' as const,
            },
            accessToken: 'admin-token',
        };

        const state = authReducer(initialState, {
            type: 'auth/login/fulfilled',
            payload: mockPayload,
        });

        expect(state.user?.role).toBe('admin');
        expect(state.isAuthenticated).toBe(true);
    });
});
