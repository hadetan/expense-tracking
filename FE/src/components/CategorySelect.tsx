import React, { useEffect, useState } from 'react';
import {
  Autocomplete,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Box,
  Alert,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchCategories, createCategory, clearCategoriesError } from '../store/slices/categoriesSlice';
import type { Category } from '../store/slices/categoriesSlice';

interface CategorySelectProps {
  value: string | null;
  onChange: (categoryId: string | null) => void;
  error?: boolean;
  helperText?: string;
  required?: boolean;
}

const CategorySelect: React.FC<CategorySelectProps> = ({
  value,
  onChange,
  error = false,
  helperText = '',
  required = false,
}) => {
  const dispatch = useAppDispatch();
  const { categories, loading, error: categoryError } = useAppSelector((state) => state.categories);
  
  const [openDialog, setOpenDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (categories.length === 0) {
      dispatch(fetchCategories());
    }
  }, [dispatch, categories.length]);

  const selectedCategory = categories.find((cat) => cat.id === value) || null;

  const handleCategoryChange = (_event: React.SyntheticEvent, newValue: Category | null) => {
    onChange(newValue ? newValue.id : null);
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;

    setCreating(true);
    try {
      const result = await dispatch(createCategory(newCategoryName.trim())).unwrap();
      onChange(result.id);
      setOpenDialog(false);
      setNewCategoryName('');
    } catch {
      // Error is handled by Redux state
    } finally {
      setCreating(false);
    }
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setNewCategoryName('');
    dispatch(clearCategoriesError());
  };

  return (
    <>
      <Box>
        <Autocomplete
          value={selectedCategory}
          onChange={handleCategoryChange}
          options={categories}
          getOptionLabel={(option) => option.name}
          loading={loading}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Category"
              required={required}
              error={error}
              helperText={helperText}
              slotProps={{
                input: {
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loading ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                },
              }}
            />
          )}
          noOptionsText={
            <Button
              size="small"
              onClick={() => setOpenDialog(true)}
              sx={{ textTransform: 'none' }}
            >
              + Create new category
            </Button>
          }
          renderOption={(props, option) => (
            <li {...props} key={option.id}>
              {option.name}
            </li>
          )}
          isOptionEqualToValue={(option, value) => option.id === value.id}
        />
        <Button
          size="small"
          onClick={() => setOpenDialog(true)}
          sx={{ mt: 1, textTransform: 'none' }}
        >
          + Add new category
        </Button>
      </Box>

      <Dialog open={openDialog} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Category</DialogTitle>
        <DialogContent>
          {categoryError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {categoryError}
            </Alert>
          )}
          <TextField
            autoFocus
            label="Category Name"
            fullWidth
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && newCategoryName.trim()) {
                handleCreateCategory();
              }
            }}
            sx={{ mt: 2 }}
            disabled={creating}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} disabled={creating}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateCategory}
            variant="contained"
            disabled={!newCategoryName.trim() || creating}
          >
            {creating ? <CircularProgress size={20} /> : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CategorySelect;
