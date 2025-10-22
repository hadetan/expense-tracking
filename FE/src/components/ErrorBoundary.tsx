import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Box, Container, Typography, Button, Paper } from '@mui/material';
import { Error as ErrorIcon } from '@mui/icons-material';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
        this.setState({
            error,
            errorInfo,
        });
    }

    private handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
        window.location.href = '/';
    };

    public render() {
        if (this.state.hasError) {
            return (
                <Container maxWidth="md">
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: '100vh',
                            py: 4,
                        }}
                    >
                        <Paper
                            elevation={3}
                            sx={{
                                p: 4,
                                textAlign: 'center',
                                width: '100%',
                            }}
                        >
                            <ErrorIcon
                                sx={{
                                    fontSize: 80,
                                    color: 'error.main',
                                    mb: 2,
                                }}
                            />
                            <Typography variant="h4" gutterBottom>
                                Oops! Something went wrong
                            </Typography>
                            <Typography variant="body1" color="text.secondary" paragraph>
                                We're sorry for the inconvenience. An unexpected error has occurred.
                            </Typography>

                            {import.meta.env.DEV && this.state.error && (
                                <Box
                                    sx={{
                                        mt: 3,
                                        p: 2,
                                        bgcolor: 'grey.100',
                                        borderRadius: 1,
                                        textAlign: 'left',
                                        maxHeight: 300,
                                        overflow: 'auto',
                                    }}
                                >
                                    <Typography
                                        variant="caption"
                                        component="pre"
                                        sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                                    >
                                        {this.state.error.toString()}
                                        {this.state.errorInfo && (
                                            <>
                                                {'\n\n'}
                                                {this.state.errorInfo.componentStack}
                                            </>
                                        )}
                                    </Typography>
                                </Box>
                            )}

                            <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
                                <Button
                                    variant="contained"
                                    onClick={this.handleReset}
                                    size="large"
                                >
                                    Go to Home
                                </Button>
                                <Button
                                    variant="outlined"
                                    onClick={() => window.location.reload()}
                                    size="large"
                                >
                                    Reload Page
                                </Button>
                            </Box>
                        </Paper>
                    </Box>
                </Container>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
