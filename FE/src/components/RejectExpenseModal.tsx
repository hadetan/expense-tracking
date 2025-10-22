import { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Typography,
    Box,
    CircularProgress,
} from '@mui/material';

interface RejectExpenseModalProps {
    open: boolean;
    onClose: () => void;
    onReject: (reason: string) => Promise<void>;
    employeeName?: string;
    expenseAmount?: string;
    expenseCategory?: string;
    expenseDescription?: string;
}

export default function RejectExpenseModal({
    open,
    onClose,
    onReject,
    employeeName,
    expenseAmount,
    expenseCategory,
    expenseDescription,
}: RejectExpenseModalProps) {
    const [rejectionReason, setRejectionReason] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleClose = () => {
        if (!loading) {
            setRejectionReason('');
            setError('');
            onClose();
        }
    };

    const handleSubmit = async () => {
        setError('');

        if (!rejectionReason.trim()) {
            setError('Rejection reason is required');
            return;
        }

        if (rejectionReason.trim().length < 10) {
            setError('Rejection reason must be at least 10 characters');
            return;
        }

        setLoading(true);
        try {
            await onReject(rejectionReason.trim());
            setRejectionReason('');
            setError('');
            onClose();
        } catch {
            setError('Failed to reject expense. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth style={{ padding: '10px' }}>
            <DialogTitle>Reject Expense</DialogTitle>
            <DialogContent>
                {employeeName && expenseAmount && (
                    <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            <strong>Employee:</strong> {employeeName}
                        </Typography>
                        <Typography variant="h6" color="primary" gutterBottom>
                            ${parseFloat(expenseAmount).toFixed(2)}
                        </Typography>
                        {expenseCategory && (
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                <strong>Category:</strong> {expenseCategory}
                            </Typography>
                        )}
                        {expenseDescription && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                <strong>Description:</strong> {expenseDescription}
                            </Typography>
                        )}
                    </Box>
                )}

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Please provide a detailed reason for rejecting this expense. The employee will see this message.
                </Typography>

                <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Rejection Reason"
                    placeholder="e.g., Receipt is not clear, expense exceeds policy limit, etc."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    error={!!error}
                    helperText={error || `${rejectionReason.length} characters (minimum 10)`}
                    disabled={loading}
                    autoFocus
                    required
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} disabled={loading}>
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    color="error"
                    disabled={loading}
                >
                    {loading ? <CircularProgress size={24} /> : 'Reject Expense'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
