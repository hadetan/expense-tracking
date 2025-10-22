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
    Pagination,
    Stack,
    Snackbar,
} from '@mui/material';
import { format } from 'date-fns';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchExpenses, approveExpense, rejectExpense } from '../store/slices/expensesSlice';
import ExpenseFilters from '../components/ExpenseFilters';
import RejectExpenseModal from '../components/RejectExpenseModal';
import type { Expense, ExpenseStatus, FetchExpensesFilters } from '../types/expenses.types';

const getStatusColor = (status: ExpenseStatus): 'warning' | 'success' | 'error' => {
    switch (status) {
        case 'PENDING':
            return 'warning';
        case 'APPROVED':
            return 'success';
        case 'REJECTED':
            return 'error';
        default:
            return 'warning';
    }
};

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

export default function AdminExpensesPage() {
    const dispatch = useAppDispatch();
    const { expenses, loading, error, pagination } = useAppSelector((state) => state.expenses);
    const [filters, setFilters] = useState<FetchExpensesFilters>({
        dateFilter: 'month',
        page: 1,
        limit: 10,
    });
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        dispatch(fetchExpenses(filters));
    }, [dispatch, filters]);

    const handleFiltersChange = (newFilters: FetchExpensesFilters) => {
        setFilters({ ...newFilters, page: 1, limit: 10 });
    };

    const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
        setFilters({ ...filters, page });
    };

    const handleApprove = async (expense: Expense) => {
        setActionLoading(expense.id);
        const result = await dispatch(approveExpense(expense.id));
        setActionLoading(null);

        if (approveExpense.fulfilled.match(result)) {
            setSnackbarMessage(`Expense of $${formatAmount(expense.amount)} approved successfully`);
            setSnackbarOpen(true);
        } else {
            setSnackbarMessage(`Failed to approve expense: ${result.payload}`);
            setSnackbarOpen(true);
        }
    };

    const handleRejectClick = (expense: Expense) => {
        setSelectedExpense(expense);
        setRejectModalOpen(true);
    };

    const handleRejectSubmit = async (rejectionReason: string) => {
        if (!selectedExpense) return;

        const result = await dispatch(rejectExpense({
            id: selectedExpense.id,
            rejectionReason
        }));

        if (rejectExpense.fulfilled.match(result)) {
            setSnackbarMessage(`Expense of $${formatAmount(selectedExpense.amount)} rejected`);
            setSnackbarOpen(true);
        } else {
            throw new Error('Failed to reject expense');
        }
    };

    const getPaginationInfo = () => {
        if (!pagination) return '';
        const start = (pagination.currentPage - 1) * pagination.limit + 1;
        const end = Math.min(pagination.currentPage * pagination.limit, pagination.totalCount);
        return `Showing ${start}-${end} of ${pagination.totalCount}`;
    };

    const expensesList = Array.isArray(expenses) ? expenses : [];

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
                    <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
                        All Team Expenses
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    <ExpenseFilters filters={filters} onFiltersChange={handleFiltersChange} />

                    {expensesList.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                No expenses found
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Try adjusting your filters
                            </Typography>
                        </Box>
                    ) : (
                        <>
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
                                        {expensesList.map((expense) => (
                                            <TableRow key={expense.id} hover>
                                                <TableCell>{formatDate(expense.date)}</TableCell>
                                                <TableCell>
                                                    <Typography variant="body2">
                                                        {expense.user?.name || 'N/A'}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {expense.user?.email || ''}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>${formatAmount(expense.amount)}</TableCell>
                                                <TableCell>{expense.category?.name || 'N/A'}</TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" sx={{ maxWidth: 300 }} noWrap>
                                                        {expense.description}
                                                    </Typography>
                                                    {expense.rejectionReason && (
                                                        <Typography variant="caption" color="error" display="block">
                                                            Reason: {expense.rejectionReason}
                                                        </Typography>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={expense.status}
                                                        color={getStatusColor(expense.status)}
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell align="right">
                                                    {expense.status === 'PENDING' && (
                                                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                            <Button
                                                                variant="contained"
                                                                color="success"
                                                                size="small"
                                                                onClick={() => handleApprove(expense)}
                                                                disabled={actionLoading === expense.id}
                                                            >
                                                                {actionLoading === expense.id ? <CircularProgress size={20} /> : 'Approve'}
                                                            </Button>
                                                            <Button
                                                                variant="contained"
                                                                color="error"
                                                                size="small"
                                                                onClick={() => handleRejectClick(expense)}
                                                                disabled={actionLoading !== null}
                                                            >
                                                                Reject
                                                            </Button>
                                                        </Stack>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            {pagination && pagination.totalPages > 1 && (
                                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="body2" color="text.secondary">
                                        {getPaginationInfo()}
                                    </Typography>
                                    <Stack spacing={2}>
                                        <Pagination
                                            count={pagination.totalPages}
                                            page={pagination.currentPage}
                                            onChange={handlePageChange}
                                            color="primary"
                                            showFirstButton
                                            showLastButton
                                        />
                                    </Stack>
                                </Box>
                            )}
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
                employeeName={selectedExpense?.user?.name || selectedExpense?.user?.email}
                expenseAmount={selectedExpense?.amount}
                expenseCategory={selectedExpense?.category?.name}
                expenseDescription={selectedExpense?.description}
            />

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={() => setSnackbarOpen(false)}
                message={snackbarMessage}
            />
        </Container>
    );
}
