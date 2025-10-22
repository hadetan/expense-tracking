import { useNavigate } from 'react-router-dom';
import {
    Container,
    Box,
    Typography,
    Paper,
    Card,
    CardContent,
    CardActions,
    Button,
} from '@mui/material';
import {
    Receipt as ReceiptIcon,
    CheckCircle as CheckCircleIcon,
    TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { useAppSelector } from '../store/hooks';

export default function AdminDashboardPage() {
    const navigate = useNavigate();
    const { user } = useAppSelector((state) => state.auth);

    const quickActions = [
        {
            title: 'All Expenses',
            description: 'View and manage all team expenses',
            icon: <ReceiptIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
            action: () => navigate('/admin/expenses'),
            buttonText: 'View Expenses',
        },
        {
            title: 'Approval Queue',
            description: 'Review and approve pending expenses',
            icon: <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main' }} />,
            action: () => navigate('/admin/approvals'),
            buttonText: 'View Queue',
        },
        {
            title: 'Analytics',
            description: 'View expense trends and analytics',
            icon: <TrendingUpIcon sx={{ fontSize: 40, color: 'info.main' }} />,
            action: () => { }, // TODO: Implement analytics page
            buttonText: 'Coming Soon',
            disabled: true,
        },
    ];

    return (
        <Container maxWidth="lg">
            <Box sx={{ py: 4 }}>
                <Paper elevation={2} sx={{ p: 4, mb: 4, bgcolor: 'primary.main', color: 'white' }}>
                    <Typography variant="h4" gutterBottom>
                        Welcome back, {user?.name || 'Admin'}! 👋
                    </Typography>
                    <Typography variant="body1">
                        Manage your team's expenses and approvals from your admin dashboard.
                    </Typography>
                </Paper>

                <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
                    Quick Actions
                </Typography>

                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                        gap: 3,
                    }}
                >
                    {quickActions.map((action, index) => (
                        <Card
                            key={index}
                            elevation={3}
                            sx={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                transition: 'transform 0.2s',
                                '&:hover': {
                                    transform: action.disabled ? 'none' : 'translateY(-4px)',
                                },
                            }}
                        >
                            <CardContent sx={{ flexGrow: 1, textAlign: 'center', pt: 4 }}>
                                <Box sx={{ mb: 2 }}>{action.icon}</Box>
                                <Typography variant="h6" gutterBottom>
                                    {action.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {action.description}
                                </Typography>
                            </CardContent>
                            <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                                <Button
                                    variant="contained"
                                    onClick={action.action}
                                    disabled={action.disabled}
                                    fullWidth
                                    sx={{ mx: 2 }}
                                >
                                    {action.buttonText}
                                </Button>
                            </CardActions>
                        </Card>
                    ))}
                </Box>

                <Box sx={{ mt: 4 }}>
                    <Paper elevation={1} sx={{ p: 3, bgcolor: 'info.light' }}>
                        <Typography variant="h6" gutterBottom>
                            📊 Analytics Dashboard Coming Soon
                        </Typography>
                        <Typography variant="body2">
                            View total expenses, pending approvals, expense trends, and category breakdowns in the upcoming analytics feature.
                        </Typography>
                    </Paper>
                </Box>
            </Box>
        </Container>
    );
}
