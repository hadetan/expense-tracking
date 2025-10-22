import { Container, Box, Typography, Button, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout } from '../store/slices/authSlice';
import AddIcon from '@mui/icons-material/Add';
import ListIcon from '@mui/icons-material/List';

export default function DashboardPage() {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);

    const handleLogout = () => {
        dispatch(logout());
    };

    return (
        <Container maxWidth="lg">
            <Box sx={{ mt: 4 }}>
                <Paper elevation={2} sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <div>
                            <Typography variant="h4" gutterBottom>
                                Welcome, {user?.name || user?.email}!
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Role: {user?.role === 'admin' ? 'Administrator' : 'Employee'}
                            </Typography>
                        </div>
                        <Button variant="outlined" onClick={handleLogout}>
                            Logout
                        </Button>
                    </Box>

                    <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
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
                            startIcon={<ListIcon />}
                            onClick={() => navigate('/expenses')}
                            size="large"
                        >
                            View My Expenses
                        </Button>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
}
