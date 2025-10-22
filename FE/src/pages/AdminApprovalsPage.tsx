import { useEffect, useState } from 'react';
import {
    Container,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Box,
    CircularProgress,
    Alert,
    Button,
    Stack,
    Snackbar,
} from '@mui/material';
import { format } from 'date-fns';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { MdChecklistRtl } from 'react-icons/md';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchExpenses, approveExpense, rejectExpense } from '../store/slices/expensesSlice';
import RejectExpenseModal from '../components/RejectExpenseModal';
import type { Expense, FetchExpensesFilters } from '../types/expenses.types';

const formatDate = (dateString: string): string => {
    try {
        return format(new Date(dateString), 'dd-MMM-yyyy');
    } catch {
        return dateString;
    }
};

const formatAmount = (amount: string): string => {
    return parseFloat(amount).toFixed(2);
};

export default function AdminApprovalsPage() {
    const dispatch = useAppDispatch();
    const { expenses, loading, error } = useAppSelector((state) => state.expenses);
    const [filters] = useState<FetchExpensesFilters>({
        status: 'PENDING',
        dateFilter: 'all',
    });
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        dispatch(fetchExpenses(filters));
    }, [dispatch, filters]);

    const handleApprove = async (expense: Expense) => {
        setActionLoading(expense.id);
        const result = await dispatch(approveExpense(expense.id));
        setActionLoading(null);

        if (approveExpense.fulfilled.match(result)) {
            setSnackbarMessage(`Expense approved successfully`);
            setSnackbarOpen(true);
        } else {
            setSnackbarMessage('Failed to approve expense');
            setSnackbarOpen(true);
        }
    };

    const handleRejectClick = (expense: Expense) => {
        setSelectedExpense(expense);
        setRejectModalOpen(true);
    };

    const handleRejectSubmit = async (reason: string) => {
        if (!selectedExpense) return;

        const result = await dispatch(rejectExpense({ id: selectedExpense.id, rejectionReason: reason }));

        if (rejectExpense.fulfilled.match(result)) {
            setSnackbarMessage(`Expense rejected`);
            setSnackbarOpen(true);
            setRejectModalOpen(false);
            setSelectedExpense(null);
        } else {
            throw new Error('Failed to reject expense');
        }
    };

    const expensesList = Array.isArray(expenses) ? expenses : [];

    const sortedExpenses = [...expensesList].sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    if (loading && expensesList.length === 0) {
        return (
            <Container maxWidth="lg">
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl">
            <Box sx={{ py: 4 }}>
                <Paper elevation={2} sx={{ p: 3 }}>
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h4" gutterBottom>
                            Approval Queue
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Review and approve pending expense submissions
                        </Typography>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    {sortedExpenses.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                            <MdChecklistRtl style={{ fontSize: 64, color: '#4caf50', marginBottom: 16 }} />
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                No pending approvals!
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                All expenses have been reviewed
                            </Typography>
                        </Box>
                    ) : (
                        <>
                            <Alert severity="info" sx={{ mb: 3 }}>
                                You have <strong>{sortedExpenses.length}</strong> expense{sortedExpenses.length !== 1 ? 's' : ''} waiting for approval
                            </Alert>

                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell><strong>Date</strong></TableCell>
                                            <TableCell><strong>Employee</strong></TableCell>
                                            <TableCell><strong>Amount</strong></TableCell>
                                            <TableCell><strong>Category</strong></TableCell>
                                            <TableCell><strong>Description</strong></TableCell>
                                            <TableCell><strong>Status</strong></TableCell>
                                            <TableCell align="right"><strong>Actions</strong></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {sortedExpenses.map((expense) => (
                                            <TableRow
                                                key={expense.id}
                                                hover
                                                sx={{
                                                    '&:hover': {
                                                        bgcolor: '#dadada',
                                                    }
                                                }}
                                            >
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight="bold">
                                                        {formatDate(expense.date)}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {format(new Date(expense.createdAt), 'HH:mm')}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight="bold">
                                                        {expense.user?.name || 'N/A'}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {expense.user?.email || ''}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body1" fontWeight="bold">
                                                        ${formatAmount(expense.amount)}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>{expense.category?.name || 'N/A'}</TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" sx={{ maxWidth: 350 }}>
                                                        {expense.description}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label="PENDING"
                                                        color="warning"
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                        <Button
                                                            variant="contained"
                                                            color="success"
                                                            size="small"
                                                            onClick={() => handleApprove(expense)}
                                                            disabled={!!actionLoading}
                                                            startIcon={actionLoading === expense.id ? <CircularProgress size={16} color="inherit" /> : <FaCheckCircle />}
                                                        >
                                                            {actionLoading === expense.id ? 'Approving...' : 'Approve'}
                                                        </Button>
                                                        <Button
                                                            variant="contained"
                                                            color="error"
                                                            size="small"
                                                            onClick={() => handleRejectClick(expense)}
                                                            disabled={!!actionLoading}
                                                            startIcon={<FaTimesCircle />}
                                                        >
                                                            Reject
                                                        </Button>
                                                    </Stack>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </>
                    )}

                    {loading && expensesList.length > 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                            <CircularProgress size={24} />
                        </Box>
                    )}
                </Paper>
            </Box>

            <RejectExpenseModal
                open={rejectModalOpen}
                onClose={() => setRejectModalOpen(false)}
                onReject={handleRejectSubmit}
                employeeName={selectedExpense?.user?.name || selectedExpense?.user?.email || 'N/A'}
                expenseAmount={selectedExpense?.amount || '0'}
                expenseCategory={selectedExpense?.category?.name}
                expenseDescription={selectedExpense?.description}
            />

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={4000}
                onClose={() => setSnackbarOpen(false)}
                message={snackbarMessage}
            />
        </Container>
    );
}
