import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AddExpensePage from './pages/AddExpensePage';
import EditExpensePage from './pages/EditExpensePage';
import ExpensesListPage from './pages/ExpensesListPage';
import BulkUploadPage from './pages/BulkUploadPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminExpensesPage from './pages/AdminExpensesPage';
import AdminApprovalsPage from './pages/AdminApprovalsPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import AdminLayout from './components/AdminLayout';

const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
    },
});

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />

                    {/* Employee Routes */}
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <DashboardPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/expenses"
                        element={
                            <ProtectedRoute>
                                <ExpensesListPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/expenses/add"
                        element={
                            <ProtectedRoute>
                                <AddExpensePage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/expenses/edit/:id"
                        element={
                            <ProtectedRoute>
                                <EditExpensePage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/expenses/bulk-upload"
                        element={
                            <ProtectedRoute>
                                <BulkUploadPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* Admin Routes */}
                    <Route
                        path="/admin"
                        element={
                            <AdminRoute>
                                <AdminLayout />
                            </AdminRoute>
                        }
                    >
                        <Route path="dashboard" element={<AdminDashboardPage />} />
                        <Route path="expenses" element={<AdminExpensesPage />} />
                        <Route path="approvals" element={<AdminApprovalsPage />} />
                    </Route>

                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    );
}

export default App;
