import { describe, it, expect, jest } from '@jest/globals';

jest.mock('../../services/api', () => ({
    default: {
        get: jest.fn(),
        post: jest.fn(),
        patch: jest.fn(),
    },
}));

import expensesReducer, { clearExpensesError, clearExpenses } from '../../store/slices/expensesSlice';
import type { Expense, PaginationMetadata } from '../../types/expenses.types';

interface ExpensesState {
    expenses: Expense[];
    loading: boolean;
    error: string | null;
    lastFetched: number | null;
    pagination: PaginationMetadata | null;
}

describe('expensesSlice', () => {
    const initialState: ExpensesState = {
        expenses: [],
        loading: false,
        error: null,
        lastFetched: null,
        pagination: null,
    };

  const mockExpense: Expense = {
    id: 'exp-123',
    userId: 'user-123',
    amount: '100.50',
    categoryId: 'cat-1',
    category: { 
      id: 'cat-1', 
      name: 'Travel',
      createdBy: 'user-123',
      createdAt: '2024-03-15T10:00:00.000Z',
      updatedAt: '2024-03-15T10:00:00.000Z'
    },
    description: 'Taxi fare',
    date: '2024-03-15T00:00:00.000Z',
    status: 'PENDING' as const,
    rejectionReason: null,
    createdAt: '2024-03-15T10:00:00.000Z',
    updatedAt: '2024-03-15T10:00:00.000Z',
  };

  const mockPagination: PaginationMetadata = {
    currentPage: 1,
    totalPages: 1,
    totalCount: 1,
    limit: 10,
    hasNextPage: false,
    hasPreviousPage: false,
  };    it('should handle initial state', () => {
        expect(expensesReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    describe('clearExpensesError', () => {
        it('should clear error state', () => {
            const stateWithError: ExpensesState = {
                ...initialState,
                error: 'Some error occurred',
            };

            const state = expensesReducer(stateWithError, clearExpensesError());
            expect(state.error).toBeNull();
        });
    });

    describe('clearExpenses', () => {
        it('should clear expenses array and pagination', () => {
            const stateWithData: ExpensesState = {
        expenses: [mockExpense],
        loading: false,
        error: null,
        lastFetched: Date.now(),
        pagination: mockPagination,
      };            const state = expensesReducer(stateWithData, clearExpenses());
            expect(state.expenses).toEqual([]);
            expect(state.pagination).toBeNull();
            expect(state.lastFetched).not.toBeNull();
        });
    });

    describe('fetchExpenses', () => {
        it('should handle fetchExpenses.pending', () => {
            const state = expensesReducer(initialState, {
                type: 'expenses/fetchExpenses/pending',
            });

            expect(state.loading).toBe(true);
            expect(state.error).toBeNull();
            expect(state.expenses).toEqual([]);
            expect(state.pagination).toBeNull();
        });

        it('should handle fetchExpenses.fulfilled', () => {
      const mockPayload = {
        expenses: [mockExpense],
        pagination: mockPagination,
      };            const state = expensesReducer(initialState, {
                type: 'expenses/fetchExpenses/fulfilled',
                payload: mockPayload,
            });

            expect(state.loading).toBe(false);
            expect(state.expenses).toEqual(mockPayload.expenses);
            expect(state.pagination).toEqual(mockPayload.pagination);
            expect(state.lastFetched).not.toBeNull();
            expect(state.error).toBeNull();
        });

        it('should handle fetchExpenses.rejected', () => {
            const state = expensesReducer(initialState, {
                type: 'expenses/fetchExpenses/rejected',
                payload: 'Failed to fetch expenses',
            });

            expect(state.loading).toBe(false);
            expect(state.error).toBe('Failed to fetch expenses');
        });
    });

    describe('createExpense', () => {
        it('should handle createExpense.pending', () => {
            const state = expensesReducer(initialState, {
                type: 'expenses/createExpense/pending',
            });

            expect(state.loading).toBe(true);
            expect(state.error).toBeNull();
        });

        it('should handle createExpense.fulfilled', () => {
            const existingState: ExpensesState = {
                ...initialState,
                expenses: [{ ...mockExpense, id: 'exp-old' }],
            };

            const newExpense = { ...mockExpense, id: 'exp-new' };

            const state = expensesReducer(existingState, {
                type: 'expenses/createExpense/fulfilled',
                payload: newExpense,
            });

            expect(state.loading).toBe(false);
            expect(state.expenses).toHaveLength(2);
            expect(state.expenses[0]).toEqual(newExpense);
            expect(state.expenses[1]?.id).toBe('exp-old');
        });

        it('should handle createExpense.rejected', () => {
            const state = expensesReducer(initialState, {
                type: 'expenses/createExpense/rejected',
                payload: 'Validation failed',
            });

            expect(state.loading).toBe(false);
            expect(state.error).toBe('Validation failed');
        });
    });

    describe('updateExpense', () => {
        it('should handle updateExpense.pending', () => {
            const state = expensesReducer(initialState, {
                type: 'expenses/updateExpense/pending',
            });

            expect(state.loading).toBe(true);
            expect(state.error).toBeNull();
        });

        it('should handle updateExpense.fulfilled', () => {
            const existingState: ExpensesState = {
                ...initialState,
                expenses: [mockExpense, { ...mockExpense, id: 'exp-2' }],
            };

            const updatedExpense = {
                ...mockExpense,
                amount: '200.00',
                description: 'Updated description',
            };

            const state = expensesReducer(existingState, {
                type: 'expenses/updateExpense/fulfilled',
                payload: updatedExpense,
            });

            expect(state.loading).toBe(false);
            expect(state.expenses[0]?.amount).toBe('200.00');
            expect(state.expenses[0]?.description).toBe('Updated description');
            expect(state.expenses).toHaveLength(2);
        });

        it('should handle updateExpense when expense not found', () => {
            const existingState: ExpensesState = {
                ...initialState,
                expenses: [{ ...mockExpense, id: 'exp-other' }],
            };

            const updatedExpense = { ...mockExpense, id: 'exp-notfound' };

            const state = expensesReducer(existingState, {
                type: 'expenses/updateExpense/fulfilled',
                payload: updatedExpense,
            });

        
            expect(state.expenses).toHaveLength(1);
            expect(state.expenses[0]?.id).toBe('exp-other');
        });

        it('should handle updateExpense.rejected', () => {
            const state = expensesReducer(initialState, {
                type: 'expenses/updateExpense/rejected',
                payload: 'Update failed',
            });

            expect(state.loading).toBe(false);
            expect(state.error).toBe('Update failed');
        });
    });

    describe('approveExpense', () => {
        it('should handle approveExpense.pending', () => {
            const state = expensesReducer(initialState, {
                type: 'expenses/approveExpense/pending',
            });

            expect(state.loading).toBe(true);
            expect(state.error).toBeNull();
        });

        it('should handle approveExpense.fulfilled', () => {
            const existingState: ExpensesState = {
                ...initialState,
                expenses: [{ ...mockExpense, status: 'PENDING' as const }],
            };

            const approvedExpense = {
                ...mockExpense,
                status: 'APPROVED' as const,
            };

            const state = expensesReducer(existingState, {
                type: 'expenses/approveExpense/fulfilled',
                payload: approvedExpense,
            });

            expect(state.loading).toBe(false);
            expect(state.expenses[0]?.status).toBe('APPROVED');
        });

        it('should handle approveExpense.rejected', () => {
            const state = expensesReducer(initialState, {
                type: 'expenses/approveExpense/rejected',
                payload: 'Approval failed',
            });

            expect(state.loading).toBe(false);
            expect(state.error).toBe('Approval failed');
        });
    });

    describe('rejectExpense', () => {
        it('should handle rejectExpense.pending', () => {
            const state = expensesReducer(initialState, {
                type: 'expenses/rejectExpense/pending',
            });

            expect(state.loading).toBe(true);
            expect(state.error).toBeNull();
        });

        it('should handle rejectExpense.fulfilled', () => {
            const existingState: ExpensesState = {
                ...initialState,
                expenses: [{ ...mockExpense, status: 'PENDING' as const }],
            };

            const rejectedExpense = {
                ...mockExpense,
                status: 'REJECTED' as const,
                rejectionReason: 'Invalid receipt',
            };

            const state = expensesReducer(existingState, {
                type: 'expenses/rejectExpense/fulfilled',
                payload: rejectedExpense,
            });

            expect(state.loading).toBe(false);
            expect(state.expenses[0]?.status).toBe('REJECTED');
            expect(state.expenses[0]?.rejectionReason).toBe('Invalid receipt');
        });

        it('should handle rejectExpense.rejected', () => {
            const state = expensesReducer(initialState, {
                type: 'expenses/rejectExpense/rejected',
                payload: 'Rejection failed',
            });

            expect(state.loading).toBe(false);
            expect(state.error).toBe('Rejection failed');
        });
    });

    describe('state management', () => {
        it('should preserve lastFetched when clearing expenses', () => {
            const timestamp = Date.now();
            const existingState: ExpensesState = {
                expenses: [mockExpense],
                loading: false,
                error: null,
                lastFetched: timestamp,
                pagination: mockPagination,
            };

            const state = expensesReducer(existingState, clearExpenses());
            expect(state.lastFetched).toBe(timestamp);
        });

        it('should handle multiple expenses correctly', () => {
            const expenses = [
                { ...mockExpense, id: 'exp-1' },
                { ...mockExpense, id: 'exp-2' },
                { ...mockExpense, id: 'exp-3' },
            ];

      const state = expensesReducer(initialState, {
        type: 'expenses/fetchExpenses/fulfilled',
        payload: {
          expenses,
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalCount: 3,
            limit: 10,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        },
      });

      expect(state.expenses).toHaveLength(3);
      expect(state.pagination?.totalCount).toBe(3);
    });
  });
});