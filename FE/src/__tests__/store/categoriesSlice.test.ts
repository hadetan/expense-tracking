import { describe, it, expect, jest } from '@jest/globals';

// Mock the API module
jest.mock('../../services/api', () => ({
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

import categoriesReducer, { clearCategoriesError } from '../../store/slices/categoriesSlice';

interface Category {
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

describe('categoriesSlice', () => {
  const initialState: CategoriesState = {
    categories: [],
    loading: false,
    error: null,
    lastFetched: null,
  };

  const mockCategory: Category = {
    id: 'cat-1',
    name: 'Travel',
    createdBy: 'user-123',
    createdAt: '2024-03-15T10:00:00.000Z',
    updatedAt: '2024-03-15T10:00:00.000Z',
  };

  it('should handle initial state', () => {
    expect(categoriesReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  describe('clearCategoriesError', () => {
    it('should clear error state', () => {
      const stateWithError: CategoriesState = {
        ...initialState,
        error: 'Some error occurred',
      };

      const state = categoriesReducer(stateWithError, clearCategoriesError());
      expect(state.error).toBeNull();
    });

    it('should not affect other state properties', () => {
      const stateWithData: CategoriesState = {
        categories: [mockCategory],
        loading: false,
        error: 'Some error',
        lastFetched: 12345,
      };

      const state = categoriesReducer(stateWithData, clearCategoriesError());
      expect(state.error).toBeNull();
      expect(state.categories).toEqual([mockCategory]);
      expect(state.lastFetched).toBe(12345);
    });
  });

  describe('fetchCategories', () => {
    it('should handle fetchCategories.pending', () => {
      const state = categoriesReducer(initialState, {
        type: 'categories/fetchCategories/pending',
      });

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle fetchCategories.fulfilled', () => {
      const mockCategories = [
        mockCategory,
        { ...mockCategory, id: 'cat-2', name: 'Food' },
      ];

      const state = categoriesReducer(initialState, {
        type: 'categories/fetchCategories/fulfilled',
        payload: mockCategories,
      });

      expect(state.loading).toBe(false);
      expect(state.categories).toEqual(mockCategories);
      expect(state.lastFetched).not.toBeNull();
      expect(state.error).toBeNull();
    });

    it('should handle fetchCategories.rejected', () => {
      const state = categoriesReducer(initialState, {
        type: 'categories/fetchCategories/rejected',
        payload: 'Failed to fetch categories',
      });

      expect(state.loading).toBe(false);
      expect(state.error).toBe('Failed to fetch categories');
    });

    it('should update lastFetched timestamp', () => {
      const beforeTime = Date.now();
      
      const state = categoriesReducer(initialState, {
        type: 'categories/fetchCategories/fulfilled',
        payload: [mockCategory],
      });

      const afterTime = Date.now();
      
      expect(state.lastFetched).not.toBeNull();
      expect(state.lastFetched!).toBeGreaterThanOrEqual(beforeTime);
      expect(state.lastFetched!).toBeLessThanOrEqual(afterTime);
    });
  });

  describe('createCategory', () => {
    it('should handle createCategory.pending', () => {
      const state = categoriesReducer(initialState, {
        type: 'categories/createCategory/pending',
      });

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle createCategory.fulfilled and add new category', () => {
      const existingState: CategoriesState = {
        ...initialState,
        categories: [mockCategory],
      };

      const newCategory = { ...mockCategory, id: 'cat-new', name: 'Office Supplies' };

      const state = categoriesReducer(existingState, {
        type: 'categories/createCategory/fulfilled',
        payload: newCategory,
      });

      expect(state.loading).toBe(false);
      expect(state.categories).toHaveLength(2);
      expect(state.categories.some(c => c.id === 'cat-new')).toBe(true);
    });

    it('should sort categories alphabetically after creation', () => {
      const existingState: CategoriesState = {
        ...initialState,
        categories: [
          { ...mockCategory, id: 'cat-1', name: 'Travel' },
          { ...mockCategory, id: 'cat-2', name: 'Food' },
        ],
      };

      const newCategory = { ...mockCategory, id: 'cat-3', name: 'Accommodation' };

      const state = categoriesReducer(existingState, {
        type: 'categories/createCategory/fulfilled',
        payload: newCategory,
      });

      expect(state.categories).toHaveLength(3);
      expect(state.categories[0]?.name).toBe('Accommodation'); // First alphabetically
      expect(state.categories[1]?.name).toBe('Food');
      expect(state.categories[2]?.name).toBe('Travel');
    });

    it('should handle createCategory.rejected', () => {
      const state = categoriesReducer(initialState, {
        type: 'categories/createCategory/rejected',
        payload: 'Category already exists',
      });

      expect(state.loading).toBe(false);
      expect(state.error).toBe('Category already exists');
    });

    it('should maintain alphabetical order with case-insensitive sorting', () => {
      const existingState: CategoriesState = {
        ...initialState,
        categories: [
          { ...mockCategory, id: 'cat-1', name: 'travel' },
        ],
      };

      const newCategory = { ...mockCategory, id: 'cat-2', name: 'ACCOMMODATION' };

      const state = categoriesReducer(existingState, {
        type: 'categories/createCategory/fulfilled',
        payload: newCategory,
      });

      expect(state.categories[0]?.name).toBe('ACCOMMODATION');
      expect(state.categories[1]?.name).toBe('travel');
    });
  });

  describe('state persistence', () => {
    it('should preserve categories when handling errors', () => {
      const stateWithCategories: CategoriesState = {
        categories: [mockCategory],
        loading: false,
        error: null,
        lastFetched: 12345,
      };

      const state = categoriesReducer(stateWithCategories, {
        type: 'categories/fetchCategories/rejected',
        payload: 'Network error',
      });

      expect(state.categories).toEqual([mockCategory]);
      expect(state.lastFetched).toBe(12345);
    });

    it('should replace categories on successful fetch', () => {
      const oldCategories = [
        { ...mockCategory, id: 'old-1', name: 'Old Category' },
      ];

      const stateWithOldData: CategoriesState = {
        categories: oldCategories,
        loading: false,
        error: null,
        lastFetched: 12345,
      };

      const newCategories = [
        { ...mockCategory, id: 'new-1', name: 'New Category' },
      ];

      const state = categoriesReducer(stateWithOldData, {
        type: 'categories/fetchCategories/fulfilled',
        payload: newCategories,
      });

      expect(state.categories).toEqual(newCategories);
      expect(state.categories).not.toEqual(oldCategories);
    });
  });
});
