import { Container, Box, Typography, Button, Paper } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout } from '../store/slices/authSlice';

export default function DashboardPage() {
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

                    <Typography variant="body1">
                        Dashboard content coming soon...
                    </Typography>
                </Paper>
            </Box>
        </Container>
    );
}
