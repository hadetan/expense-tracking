import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Box,
    Alert,
    CircularProgress,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { createExpense, clearExpensesError } from '../store/slices/expensesSlice';
import CategorySelect from '../components/CategorySelect';

export default function AddExpensePage() {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { loading, error } = useAppSelector((state) => state.expenses);

    const [amount, setAmount] = useState('');
    const [categoryId, setCategoryId] = useState<string | null>(null);
    const [description, setDescription] = useState('');
    const [date, setDate] = useState<Date | null>(new Date());

    const [errors, setErrors] = useState<{
        amount?: string;
        categoryId?: string;
        description?: string;
        date?: string;
    }>({});

    const validateForm = (): boolean => {
        const newErrors: typeof errors = {};

        const amountNum = parseFloat(amount);
        if (!amount) {
            newErrors.amount = 'Amount is required';
        } else if (isNaN(amountNum) || amountNum <= 0) {
            newErrors.amount = 'Amount must be a positive number';
        }

        if (!categoryId) {
            newErrors.categoryId = 'Category is required';
        }

        if (!description.trim()) {
            newErrors.description = 'Description is required';
        } else if (description.length > 500) {
            newErrors.description = 'Description must not exceed 500 characters';
        }

        if (!date) {
            newErrors.date = 'Date is required';
        } else if (date > new Date()) {
            newErrors.date = 'Date cannot be in the future';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(clearExpensesError());

        if (!validateForm()) {
            return;
        }

        try {
            await dispatch(
                createExpense({
                    amount: parseFloat(amount),
                    categoryId: categoryId!,
                    description: description.trim(),
                    date: date!.toISOString(),
                })
            ).unwrap();

            setAmount('');
            setCategoryId(null);
            setDescription('');
            setDate(new Date());
            setErrors({});

            navigate('/dashboard');
        } catch (err) {
            console.error('Failed to create expense:', err);
        }
    };

    return (
        <Container maxWidth="md">
            <Box sx={{ mt: 4, mb: 4 }}>
                <Paper elevation={2} sx={{ p: 4 }}>
                    <Typography variant="h4" gutterBottom>
                        Add New Expense
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Submit an expense for approval
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }} onClose={() => dispatch(clearExpensesError())}>
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <TextField
                                label="Amount"
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                error={!!errors.amount}
                                helperText={errors.amount}
                                required
                                inputProps={{ step: '0.01', min: '0' }}
                                fullWidth
                            />

                            <CategorySelect
                                value={categoryId}
                                onChange={setCategoryId}
                                error={!!errors.categoryId}
                                helperText={errors.categoryId}
                                required
                            />

                            <TextField
                                label="Description"
                                multiline
                                rows={4}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                error={!!errors.description}
                                helperText={
                                    errors.description ||
                                    `${description.length}/500 characters`
                                }
                                required
                                fullWidth
                            />

                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <DatePicker
                                    label="Date"
                                    value={date}
                                    onChange={(newDate) => setDate(newDate)}
                                    maxDate={new Date()}
                                    slotProps={{
                                        textField: {
                                            required: true,
                                            error: !!errors.date,
                                            helperText: errors.date,
                                            fullWidth: true,
                                        },
                                    }}
                                />
                            </LocalizationProvider>

                            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                                <Button
                                    variant="outlined"
                                    onClick={() => navigate('/dashboard')}
                                    disabled={loading}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={loading}
                                    startIcon={loading ? <CircularProgress size={20} /> : null}
                                >
                                    {loading ? 'Submitting...' : 'Submit Expense'}
                                </Button>
                            </Box>
                        </Box>
                    </form>
                </Paper>
            </Box>
        </Container>
    );
}
