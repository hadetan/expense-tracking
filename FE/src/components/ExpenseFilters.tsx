import { useState } from 'react';
import {
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Stack,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useAppSelector } from '../store/hooks';
import type { FetchExpensesFilters } from '../types/expenses.types';

interface ExpenseFiltersProps {
    filters: FetchExpensesFilters;
    onFiltersChange: (filters: FetchExpensesFilters) => void;
}

export default function ExpenseFilters({ filters, onFiltersChange }: ExpenseFiltersProps) {
    const { categories } = useAppSelector((state) => state.categories);
    const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
    const [customEndDate, setCustomEndDate] = useState<Date | null>(null);

    const handleDateFilterChange = (event: SelectChangeEvent<string>) => {
        const value = event.target.value as FetchExpensesFilters['dateFilter'];

        if (value === 'custom') {
            onFiltersChange({
                ...filters,
                dateFilter: value,
                startDate: customStartDate?.toISOString(),
                endDate: customEndDate?.toISOString(),
            });
        } else {
            onFiltersChange({
                ...filters,
                dateFilter: value,
                startDate: undefined,
                endDate: undefined,
            });
        }
    };

    const handleStatusChange = (event: SelectChangeEvent<string>) => {
        const value = event.target.value;
        onFiltersChange({
            ...filters,
            status: value === 'all' ? undefined : value,
        });
    };

    const handleCategoryChange = (event: SelectChangeEvent<string>) => {
        const value = event.target.value;
        onFiltersChange({
            ...filters,
            categoryId: value === 'all' ? undefined : value,
        });
    };

    const handleCustomStartDateChange = (date: Date | null) => {
        setCustomStartDate(date);
        if (filters.dateFilter === 'custom') {
            onFiltersChange({
                ...filters,
                startDate: date?.toISOString(),
            });
        }
    };

    const handleCustomEndDateChange = (date: Date | null) => {
        setCustomEndDate(date);
        if (filters.dateFilter === 'custom') {
            onFiltersChange({
                ...filters,
                endDate: date?.toISOString(),
            });
        }
    };

    return (
        <Box sx={{ mb: 3 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} flexWrap="wrap">
                <Box sx={{ minWidth: 200, flex: 1 }}>
                    <FormControl fullWidth>
                        <InputLabel>Date Filter</InputLabel>
                        <Select
                            value={filters.dateFilter || 'month'}
                            label="Date Filter"
                            onChange={handleDateFilterChange}
                        >
                            <MenuItem value="today">Today</MenuItem>
                            <MenuItem value="week">This Week</MenuItem>
                            <MenuItem value="month">This Month</MenuItem>
                            <MenuItem value="custom">Custom Range</MenuItem>
                            <MenuItem value="all">All Time</MenuItem>
                        </Select>
                    </FormControl>
                </Box>

                {filters.dateFilter === 'custom' && (
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <Box sx={{ minWidth: 200, flex: 1 }}>
                            <DatePicker
                                label="Start Date"
                                value={customStartDate}
                                onChange={handleCustomStartDateChange}
                                slotProps={{ textField: { fullWidth: true } }}
                            />
                        </Box>
                        <Box sx={{ minWidth: 200, flex: 1 }}>
                            <DatePicker
                                label="End Date"
                                value={customEndDate}
                                onChange={handleCustomEndDateChange}
                                minDate={customStartDate || undefined}
                                slotProps={{ textField: { fullWidth: true } }}
                            />
                        </Box>
                    </LocalizationProvider>
                )}

                <Box sx={{ minWidth: 200, flex: 1 }}>
                    <FormControl fullWidth>
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={filters.status || 'all'}
                            label="Status"
                            onChange={handleStatusChange}
                        >
                            <MenuItem value="all">All</MenuItem>
                            <MenuItem value="PENDING">Pending</MenuItem>
                            <MenuItem value="APPROVED">Approved</MenuItem>
                            <MenuItem value="REJECTED">Rejected</MenuItem>
                        </Select>
                    </FormControl>
                </Box>

                <Box sx={{ minWidth: 200, flex: 1 }}>
                    <FormControl fullWidth>
                        <InputLabel>Category</InputLabel>
                        <Select
                            value={filters.categoryId || 'all'}
                            label="Category"
                            onChange={handleCategoryChange}
                        >
                            <MenuItem value="all">All Categories</MenuItem>
                            {categories.map((category) => (
                                <MenuItem key={category.id} value={category.id}>
                                    {category.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
            </Stack>
        </Box>
    );
}