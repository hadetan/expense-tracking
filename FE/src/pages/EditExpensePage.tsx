import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import { format } from 'date-fns';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { updateExpense, clearExpensesError } from '../store/slices/expensesSlice';
import CategorySelect from '../components/CategorySelect';

export default function EditExpensePage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { expenses, loading, error } = useAppSelector((state) => state.expenses);

    const expense = expenses.find(e => e.id === id);

    const [amount, setAmount] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState<Date | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (expense) {
            setAmount(expense.amount);
            setCategoryId(expense.categoryId);
            setDescription(expense.description);
            setDate(new Date(expense.date));
        }
    }, [expense]);

    useEffect(() => {
        return () => {
            dispatch(clearExpensesError());
        };
    }, [dispatch]);

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!amount || parseFloat(amount) <= 0) {
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

        if (!validate() || !id) return;

        const result = await dispatch(updateExpense({
            id,
            data: {
                amount: parseFloat(amount),
                categoryId,
                description: description.trim(),
                date: format(date!, 'yyyy-MM-dd'),
            }
        }));

        if (updateExpense.fulfilled.match(result)) {
            setSuccess(true);
            setTimeout(() => {
                navigate('/expenses');
            }, 1500);
        }
    };

    if (!expense) {
        return (
            <Container maxWidth="md">
                <Box sx={{ mt: 4 }}>
                    <Alert severity="error">Expense not found</Alert>
                    <Button onClick={() => navigate('/expenses')} sx={{ mt: 2 }}>
                        Back to Expenses
                    </Button>
                </Box>
            </Container>
        );
    }

    if (expense.status === 'APPROVED') {
        return (
            <Container maxWidth="md">
                <Box sx={{ mt: 4 }}>
                    <Alert severity="warning">
                        Approved expenses cannot be edited
                    </Alert>
                    <Button onClick={() => navigate('/expenses')} sx={{ mt: 2 }}>
                        Back to Expenses
                    </Button>
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="md">
            <Box sx={{ mt: 4, mb: 4 }}>
                <Paper elevation={2} sx={{ p: 4 }}>
                    <Typography variant="h4" gutterBottom>
                        Edit Expense
                    </Typography>

                    {expense.status === 'REJECTED' && expense.rejectionReason && (
                        <Alert severity="warning" sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" gutterBottom>
                                Previous Rejection Reason:
                            </Typography>
                            <Typography variant="body2">
                                {expense.rejectionReason}
                            </Typography>
                        </Alert>
                    )}

                    <Alert severity="info" sx={{ mb: 3 }}>
                        Resubmitting this expense will reset its status to Pending
                    </Alert>

                    {success && (
                        <Alert severity="success" sx={{ mb: 3 }}>
                            Expense updated successfully! Redirecting...
                        </Alert>
                    )}

                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit} noValidate>
                        <TextField
                            fullWidth
                            label="Amount"
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            error={!!errors.amount}
                            helperText={errors.amount}
                            inputProps={{ step: '0.01', min: '0' }}
                            sx={{ mb: 3 }}
                            required
                        />

                        <Box sx={{ mb: 3 }}>
                            <CategorySelect
                                value={categoryId}
                                onChange={(value) => setCategoryId(value || '')}
                                error={!!errors.categoryId}
                                helperText={errors.categoryId}
                            />
                        </Box>

                        <TextField
                            fullWidth
                            label="Description"
                            multiline
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            error={!!errors.description}
                            helperText={errors.description || `${description.length}/500 characters`}
                            sx={{ mb: 3 }}
                            required
                        />

                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                                label="Date"
                                value={date}
                                onChange={(newDate) => setDate(newDate)}
                                maxDate={new Date()}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        required: true,
                                        error: !!errors.date,
                                        helperText: errors.date,
                                        sx: { mb: 3 }
                                    }
                                }}
                            />
                        </LocalizationProvider>

                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                disabled={loading}
                                sx={{ flex: 1 }}
                            >
                                {loading ? <CircularProgress size={24} /> : 'Update Expense'}
                            </Button>
                            <Button
                                variant="outlined"
                                size="large"
                                onClick={() => navigate('/expenses')}
                                disabled={loading}
                                sx={{ flex: 1 }}
                            >
                                Cancel
                            </Button>
                        </Box>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
}
