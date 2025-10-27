import { useEffect, useState } from 'react';
import {
    Container,
    Box,
    Typography,
    Button,
    Paper,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    CircularProgress,
    Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchExpenses } from '../store/slices/expensesSlice';
import AddIcon from '@mui/icons-material/Add';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { format } from 'date-fns';

export default function DashboardPage() {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);
    const { expenses, loading, error } = useAppSelector((state) => state.expenses);
    const [stats, setStats] = useState({
        thisMonthTotal: 0,
        pendingCount: 0,
        approvedCount: 0,
        rejectedCount: 0,
    });

    useEffect(() => {
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const endDate = now.toISOString();

        dispatch(fetchExpenses({ startDate, endDate, dateFilter: 'month' }));
    }, [dispatch]);

    useEffect(() => {
        const expensesList = Array.isArray(expenses) ? expenses : [];
        const thisMonthTotal = expensesList.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
        const pendingCount = expensesList.filter((exp) => exp.status === 'PENDING').length;
        const approvedCount = expensesList.filter((exp) => exp.status === 'APPROVED').length;
        const rejectedCount = expensesList.filter((exp) => exp.status === 'REJECTED').length;

        setStats({ thisMonthTotal, pendingCount, approvedCount, rejectedCount });
    }, [expenses]);

    const recentExpenses = Array.isArray(expenses)
        ? expenses.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)
        : [];

    const formatCurrency = (amount: string): string => {
        return `$${parseFloat(amount).toFixed(2)}`;
    };

    const formatDate = (dateString: string): string => {
        try {
            return format(new Date(dateString), 'dd-MMM-yyyy');
        } catch {
            return dateString;
        }
    };

    const getStatusColor = (status: string): 'warning' | 'success' | 'error' => {
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

    return (
        <Container maxWidth="xl">
            <Box sx={{ py: 4 }}>
                <Paper elevation={2} sx={{ p: 3, mb: 4, bgcolor: 'primary.main', color: 'white' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                            <Typography variant="h4" gutterBottom>
                                Welcome, {user?.name || user?.email}!
                            </Typography>
                            <Typography variant="body1">Track and manage your expenses</Typography>
                        </Box>
                    </Box>
                </Paper>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                        gap: 3,
                        mb: 4,
                    }}
                >
                    <Card elevation={3}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <AttachMoneyIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        This Month
                                    </Typography>
                                    <Typography variant="h5" fontWeight="bold">
                                        {formatCurrency(stats.thisMonthTotal.toString())}
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>

                    <Card elevation={3}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Approved
                                    </Typography>
                                    <Typography variant="h5" fontWeight="bold">
                                        {stats.approvedCount}
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>

                    <Card elevation={3}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <PendingActionsIcon sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Pending
                                    </Typography>
                                    <Typography variant="h5" fontWeight="bold">
                                        {stats.pendingCount}
                                    </Typography>
                                </Box>
                            </Box>
                            {stats.pendingCount > 0 && (
                                <Button
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    startIcon={<VisibilityIcon />}
                                    onClick={() => navigate('/expenses', { state: { filterStatus: 'PENDING' } })}
                                    sx={{ mt: 1 }}
                                >
                                    View
                                </Button>
                            )}
                        </CardContent>
                    </Card>

                    <Card elevation={3}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <CancelIcon sx={{ fontSize: 40, color: 'error.main', mr: 2 }} />
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Rejected
                                    </Typography>
                                    <Typography variant="h5" fontWeight="bold">
                                        {stats.rejectedCount}
                                    </Typography>
                                </Box>
                            </Box>
                            {stats.rejectedCount > 0 && (
                                <Button
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    startIcon={<VisibilityIcon />}
                                    onClick={() => navigate('/expenses', { state: { filterStatus: 'REJECTED' } })}
                                    sx={{ mt: 1 }}
                                >
                                    View
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </Box>

                <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                        Quick Actions
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => navigate('/expenses/add')}
                            size="large"
                        >
                            Add New Expense
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<CloudUploadIcon />}
                            onClick={() => navigate('/expenses/bulk-upload')}
                            size="large"
                            color="secondary"
                        >
                            Bulk Upload
                        </Button>
                    </Box>
                </Paper>

                <Paper elevation={3} sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                        Recent Expenses
                    </Typography>

                    {loading && recentExpenses.length === 0 ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : recentExpenses.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <Typography variant="body2" color="text.secondary">
                                No expenses yet. Click "Add New Expense" to get started!
                            </Typography>
                        </Box>
                    ) : (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Date</TableCell>
                                        <TableCell>Amount</TableCell>
                                        <TableCell>Category</TableCell>
                                        <TableCell>Description</TableCell>
                                        <TableCell>Status</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {recentExpenses.map((expense) => (
                                        <TableRow
                                            key={expense.id}
                                            hover
                                            onClick={() => navigate('/expenses')}
                                            sx={{ cursor: 'pointer' }}
                                        >
                                            <TableCell>{formatDate(expense.date)}</TableCell>
                                            <TableCell>
                                                <Typography variant="body1" fontWeight="bold">
                                                    {formatCurrency(expense.amount)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>{expense.category?.name || 'N/A'}</TableCell>
                                            <TableCell>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        maxWidth: 250,
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                    }}
                                                >
                                                    {expense.description}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip label={expense.status} color={getStatusColor(expense.status)} size="small" />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}

                    {recentExpenses.length > 0 && (
                        <Box sx={{ mt: 2, textAlign: 'center' }}>
                            <Button variant="text" onClick={() => navigate('/expenses')}>
                                View All Expenses →
                            </Button>
                        </Box>
                    )}
                </Paper>
            </Box>
        </Container>
    );
}
