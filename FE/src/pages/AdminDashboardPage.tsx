import { useEffect, useState } from 'react';
import {
    Container,
    Box,
    Typography,
    Paper,
    Card,
    CardContent,
    CircularProgress,
    Alert,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
} from '@mui/material';
import {
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    PendingActions as PendingIcon,
    AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { PieLabelRenderProps } from 'recharts';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchAnalytics } from '../store/slices/analyticsSlice';
import type { ChartDataPoint } from '../types/analytics.types';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#8DD1E1'];

export default function AdminDashboardPage() {
    const dispatch = useAppDispatch();
    const { data, loading, error } = useAppSelector((state) => state.analytics);
    const [dateFilter, setDateFilter] = useState('thisMonth');

    useEffect(() => {
        const now = new Date();
        let startDate: string | undefined;
        let endDate: string | undefined;

        switch (dateFilter) {
            case 'thisMonth':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
                endDate = now.toISOString();
                break;
            case 'lastMonth':
                startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
                endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString();
                break;
            case 'last3Months':
                startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1).toISOString();
                endDate = now.toISOString();
                break;
            default:
                break;
        }

        dispatch(fetchAnalytics({ startDate, endDate }));
    }, [dispatch, dateFilter]);

    const formatCurrency = (amount: string): string => {
        return `$${parseFloat(amount).toFixed(2)}`;
    };

    const chartData: ChartDataPoint[] = data?.totalByCategory.map((cat) => ({
        name: cat.categoryName,
        value: parseFloat(cat.total),
        percentage: cat.percentage,
    })) || [];

    const renderPieLabel = (props: PieLabelRenderProps): string => {
        const entry = props as PieLabelRenderProps & ChartDataPoint;
        return `${entry.name}: ${entry.percentage.toFixed(1)}%`;
    };

    const formatTooltipValue = (value: number | string): string => {
        return formatCurrency(value.toString());
    };

    if (loading && !data) {
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
                {/* Header */}
                <Paper elevation={2} sx={{ p: 3, mb: 4, bgcolor: 'primary.main', color: 'white' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                            <Typography variant="h4" gutterBottom>
                                Analytics Dashboard
                            </Typography>
                            <Typography variant="body1">
                                Team expense insights and trends
                            </Typography>
                        </Box>
                        <FormControl sx={{ minWidth: 200, bgcolor: 'white', borderRadius: 1 }}>
                            <InputLabel>Date Range</InputLabel>
                            <Select
                                value={dateFilter}
                                label="Date Range"
                                onChange={(e) => setDateFilter(e.target.value)}
                            >
                                <MenuItem value="thisMonth">This Month</MenuItem>
                                <MenuItem value="lastMonth">Last Month</MenuItem>
                                <MenuItem value="last3Months">Last 3 Months</MenuItem>
                            </Select>
                        </FormControl>
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
                        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                        gap: 3,
                        mb: 4,
                    }}
                >
                    <Box>
                        <Card elevation={3}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <MoneyIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            Current Month Total
                                        </Typography>
                                        <Typography variant="h4" fontWeight="bold">
                                            {formatCurrency(data?.currentMonthTotal || '0')}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Typography variant="caption" color="text.secondary">
                                    Approved expenses from {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Box>

                    <Box>
                        <Card elevation={3}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <PendingIcon sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            Pending Approvals
                                        </Typography>
                                        <Typography variant="h4" fontWeight="bold">
                                            {data?.pendingApprovalsCount || 0}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Typography variant="caption" color="text.secondary">
                                    Expenses waiting for review
                                </Typography>
                            </CardContent>
                        </Card>
                    </Box>

                    <Box>
                        <Card elevation={3}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    {(data?.trendPercentage || 0) >= 0 ? (
                                        <TrendingUpIcon sx={{ fontSize: 40, color: 'error.main', mr: 2 }} />
                                    ) : (
                                        <TrendingDownIcon sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                                    )}
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            Monthly Trend
                                        </Typography>
                                        <Typography
                                            variant="h4"
                                            fontWeight="bold"
                                            sx={{ color: (data?.trendPercentage || 0) >= 0 ? 'error.main' : 'success.main' }}
                                        >
                                            {(data?.trendPercentage || 0) >= 0 ? '+' : ''}
                                            {data?.trendPercentage?.toFixed(1) || '0.0'}%
                                        </Typography>
                                    </Box>
                                </Box>
                                <Typography variant="caption" color="text.secondary">
                                    vs. previous month
                                </Typography>
                            </CardContent>
                        </Card>
                    </Box>
                </Box>

                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                        gap: 3,
                    }}
                >
                    <Box>
                        <Paper elevation={3} sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom fontWeight="bold">
                                Expenses by Category
                            </Typography>
                            {chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={chartData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={true}
                                            label={renderPieLabel}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {chartData.map((_entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={formatTooltipValue} />
                                        {/* <Legend /> */}
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        No expense data for selected date range
                                    </Typography>
                                </Box>
                            )}
                        </Paper>
                    </Box>

                    <Box>
                        <Paper elevation={3} sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom fontWeight="bold">
                                Category Breakdown
                            </Typography>
                            {chartData.length > 0 ? (
                                <Box sx={{ mt: 2 }}>
                                    {data?.totalByCategory.map((cat, index) => (
                                        <Box
                                            key={cat.categoryId}
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                p: 2,
                                                mb: 1,
                                                bgcolor: 'grey.50',
                                                borderRadius: 1,
                                                borderLeft: `4px solid ${COLORS[index % COLORS.length]}`,
                                            }}
                                        >
                                            <Typography variant="body1" fontWeight="medium">
                                                {cat.categoryName}
                                            </Typography>
                                            <Box sx={{ textAlign: 'right' }}>
                                                <Typography variant="h6" fontWeight="bold">
                                                    {formatCurrency(cat.total)}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {cat.percentage.toFixed(1)}% of total
                                                </Typography>
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                            ) : (
                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        No expense data for selected date range
                                    </Typography>
                                </Box>
                            )}
                        </Paper>
                    </Box>
                </Box>
            </Box>
        </Container>
    );
}
