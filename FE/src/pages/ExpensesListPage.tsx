import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    Button,
    Box,
    CircularProgress,
    Alert,
    IconButton,
    Tooltip,
    Pagination,
    Stack,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { format } from 'date-fns';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchExpenses } from '../store/slices/expensesSlice';
import type { Expense, ExpenseStatus, FetchExpensesFilters } from '../store/slices/expensesSlice';
import ExpenseFilters from '../components/ExpenseFilters';

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

export default function ExpensesListPage() {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { expenses, loading, error, pagination } = useAppSelector((state) => state.expenses);
    const [filters, setFilters] = useState<FetchExpensesFilters>({ 
        dateFilter: 'month',
        page: 1,
        limit: 10,
    });

    useEffect(() => {
        dispatch(fetchExpenses(filters));
    }, [dispatch, filters]);

    const handleFiltersChange = (newFilters: FetchExpensesFilters) => {
        setFilters({ ...newFilters, page: 1, limit: 10 });
    };

    const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
        setFilters({ ...filters, page });
    };

    const canEdit = (expense: Expense): boolean => {
        return expense.status === 'PENDING' || expense.status === 'REJECTED';
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
        <Container maxWidth="lg">
            <Box sx={{ mt: 4, mb: 4 }}>
                <Paper elevation={2} sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h4">
                            My Expenses
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => navigate('/expenses/add')}
                        >
                            Add Expense
                        </Button>
                    </Box>

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
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                Start by adding your first expense
                            </Typography>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => navigate('/expenses/add')}
                            >
                                Add Your First Expense
                            </Button>
                        </Box>
                    ) : (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell><strong>Date</strong></TableCell>
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
                                                {canEdit(expense) && (
                                                    <Tooltip title="Edit expense">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => navigate(`/expenses/edit/${expense.id}`)}
                                                        >
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}

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

                    {loading && expensesList.length > 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                            <CircularProgress size={24} />
                        </Box>
                    )}
                </Paper>
            </Box>
        </Container>
    );
}
