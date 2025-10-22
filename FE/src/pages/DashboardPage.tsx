import { Container, Box, Typography, Button, Paper } from '@mui/material';
import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout } from '../store/slices/authSlice';
import CategorySelect from '../components/CategorySelect';

export default function DashboardPage() {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

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

                    <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                        Test Category Management
                    </Typography>
                    <Box sx={{ maxWidth: 400, mt: 2 }}>
                        <CategorySelect
                            value={selectedCategory}
                            onChange={setSelectedCategory}
                            required
                        />
                        {selectedCategory && (
                            <Typography variant="body2" sx={{ mt: 2 }}>
                                Selected Category ID: {selectedCategory}
                            </Typography>
                        )}
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
}
