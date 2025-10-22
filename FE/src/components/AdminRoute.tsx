import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { Container, Paper, Typography, Button, Box } from '@mui/material';

interface AdminRouteProps {
    children: React.ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
    const { isAuthenticated, user } = useAppSelector((state) => state.auth);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (user?.role !== 'admin') {
        return (
            <Container maxWidth="md">
                <Box sx={{ mt: 8 }}>
                    <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
                        <Typography variant="h5" color="error" gutterBottom>
                            Access Denied
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                            You do not have permission to access this page. Admin access is required.
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={() => window.location.href = '/dashboard'}
                        >
                            Go to Dashboard
                        </Button>
                    </Paper>
                </Box>
            </Container>
        );
    }

    return <>{children}</>;
}
