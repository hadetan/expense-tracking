import { useState } from 'react';
import {
    Container,
    Paper,
    Typography,
    Button,
    Box,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    LinearProgress,
    Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../store/hooks';
import { fetchCategories } from '../store/slices/categoriesSlice';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import api from '../services/api';

interface UploadSummary {
    total: number;
    successful: number;
    failed: number;
}

interface FailedRow {
    row: number;
    field?: string;
    error: string;
}

interface SuccessfulExpense {
    id: string;
    amount: string;
    category: string;
    description: string;
    date: string;
}

interface UploadResponse {
    summary: UploadSummary;
    successfulExpenses: SuccessfulExpense[];
    failedRows: FailedRow[];
}

export default function BulkUploadPage() {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null);
    const [error, setError] = useState<string>('');

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const validTypes = [
                'text/csv',
                'application/csv',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            ];

            if (!validTypes.includes(file.type) && !file.name.endsWith('.csv') && !file.name.endsWith('.xlsx')) {
                setError('Invalid file type. Please upload a CSV or Excel file.');
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                setError('File size exceeds 5MB limit.');
                return;
            }

            setSelectedFile(file);
            setError('');
            setUploadResult(null);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setError('Please select a file first.');
            return;
        }

        setUploading(true);
        setUploadProgress(0);
        setError('');

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await api.post<UploadResponse>('/expenses/bulk-upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setUploadProgress(percentCompleted);
                    }
                },
            });

            setUploadResult(response.data);
            setSelectedFile(null);

            dispatch(fetchCategories());
            const fileInput = document.getElementById('file-upload-input') as HTMLInputElement;
            if (fileInput) {
                fileInput.value = '';
            }
        } catch (err) {
            const errorMessage = err && typeof err === 'object' && 'response' in err && 
                err.response && typeof err.response === 'object' && 'data' in err.response &&
                err.response.data && typeof err.response.data === 'object' && 'error' in err.response.data
                ? String(err.response.data.error)
                : 'Failed to upload file. Please try again.';
            setError(errorMessage);
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const downloadTemplate = () => {
        const headers = ['Date', 'Amount', 'Category', 'Description'];
        const sampleData = [
            ['22-10-2025', '150.00', 'Travel', 'Taxi to client meeting'],
            ['21-10-2025', '45.50', 'Meals', 'Team lunch'],
            ['20-10-2025', '299.99', 'Software', 'Adobe Creative Cloud subscription'],
        ];

        const csvContent = [
            headers.join(','),
            ...sampleData.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', 'expense_template.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const downloadErrorReport = () => {
        if (!uploadResult || uploadResult.failedRows.length === 0) return;

        const headers = ['Row', 'Field', 'Error'];
        const errorData = uploadResult.failedRows.map(row => [
            row.row.toString(),
            row.field || 'general',
            row.error
        ]);

        const csvContent = [
            headers.join(','),
            ...errorData.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', 'upload_errors.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Container maxWidth="lg">
            <Box sx={{ mt: 4, mb: 4 }}>
                <Paper elevation={2} sx={{ p: 3 }}>
                    <Typography variant="h4" gutterBottom>
                        Bulk Expense Upload
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Upload multiple expenses at once using a CSV or Excel file
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    <Box sx={{ mb: 4, p: 2, bgcolor: 'primary.50', borderRadius: 1 }}>
                        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                            Step 1: Download Template
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Download the template file with the correct format. Expected columns: Date (dd-mm-yyyy), Amount, Category, Description
                        </Typography>
                        <Button
                            variant="outlined"
                            startIcon={<DownloadIcon />}
                            onClick={downloadTemplate}
                        >
                            Download CSV Template
                        </Button>
                    </Box>

                    <Box sx={{ mb: 4 }}>
                        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                            Step 2: Upload Your File
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Select a CSV or Excel file to upload (max 5MB)
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                            <Button
                                variant="contained"
                                component="label"
                                startIcon={<CloudUploadIcon />}
                                disabled={uploading}
                            >
                                Select File
                                <input
                                    id="file-upload-input"
                                    type="file"
                                    hidden
                                    accept=".csv,.xlsx,.xls"
                                    onChange={handleFileSelect}
                                />
                            </Button>

                            {selectedFile && (
                                <Typography variant="body2">
                                    Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                                </Typography>
                            )}

                            {selectedFile && (
                                <Button
                                    variant="contained"
                                    color="success"
                                    onClick={handleUpload}
                                    disabled={uploading}
                                >
                                    {uploading ? 'Uploading...' : 'Upload'}
                                </Button>
                            )}
                        </Box>

                        {uploading && (
                            <Box sx={{ mt: 2 }}>
                                <LinearProgress variant="determinate" value={uploadProgress} />
                                <Typography variant="caption" color="text.secondary">
                                    Uploading... {uploadProgress}%
                                </Typography>
                            </Box>
                        )}
                    </Box>

                    {uploadResult && (
                        <Box sx={{ mt: 4 }}>
                            <Typography variant="h6" gutterBottom>
                                Upload Results
                            </Typography>

                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mb: 3 }}>
                                <Paper elevation={1} sx={{ p: 2, textAlign: 'center', bgcolor: 'info.50' }}>
                                    <FormatListNumberedIcon sx={{ fontSize: 32, color: 'info.main', mb: 1 }} />
                                    <Typography variant="body2" color="text.secondary">
                                        Total Rows
                                    </Typography>
                                    <Typography variant="h4" color="info.main">{uploadResult.summary.total}</Typography>
                                </Paper>
                                <Paper elevation={1} sx={{ p: 2, textAlign: 'center', bgcolor: 'success.50' }}>
                                    <CheckCircleIcon sx={{ fontSize: 32, color: 'success.main', mb: 1 }} />
                                    <Typography variant="body2" color="text.secondary">
                                        Successful
                                    </Typography>
                                    <Typography variant="h4" color="success.main">
                                        {uploadResult.summary.successful}
                                    </Typography>
                                </Paper>
                                <Paper elevation={1} sx={{ p: 2, textAlign: 'center', bgcolor: 'error.50' }}>
                                    <ErrorIcon sx={{ fontSize: 32, color: 'error.main', mb: 1 }} />
                                    <Typography variant="body2" color="text.secondary">
                                        Failed
                                    </Typography>
                                    <Typography variant="h4" color="error.main">
                                        {uploadResult.summary.failed}
                                    </Typography>
                                </Paper>
                            </Box>

                            {uploadResult.failedRows.length > 0 && (
                                <Box sx={{ mt: 3 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            Failed Rows
                                        </Typography>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            startIcon={<DownloadIcon />}
                                            onClick={downloadErrorReport}
                                        >
                                            Download Error Report
                                        </Button>
                                    </Box>

                                    <TableContainer component={Paper} variant="outlined">
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell><strong>Row</strong></TableCell>
                                                    <TableCell><strong>Field</strong></TableCell>
                                                    <TableCell><strong>Error</strong></TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {uploadResult.failedRows.map((failedRow, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell>
                                                            <Chip label={`Row ${failedRow.row}`} size="small" />
                                                        </TableCell>
                                                        <TableCell>{failedRow.field || 'general'}</TableCell>
                                                        <TableCell>
                                                            <Typography variant="body2" color="error">
                                                                {failedRow.error}
                                                            </Typography>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Box>
                            )}

                            {uploadResult.summary.successful > 0 && (
                                <Box sx={{ mt: 3 }}>
                                    <Alert severity="success" sx={{ mb: 2 }}>
                                        Successfully uploaded {uploadResult.summary.successful} expense{uploadResult.summary.successful !== 1 ? 's' : ''}!
                                    </Alert>
                                    <Button
                                        variant="contained"
                                        onClick={() => navigate('/expenses')}
                                    >
                                        View My Expenses
                                    </Button>
                                </Box>
                            )}
                        </Box>
                    )}
                </Paper>
            </Box>
        </Container>
    );
}
