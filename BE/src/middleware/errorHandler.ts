import type { Request, Response, NextFunction } from 'express';

interface PrismaError extends Error {
    code?: string;
    meta?: Record<string, unknown>;
}

export class AppError extends Error {
    statusCode: number;
    isOperational: boolean;

    constructor(message: string, statusCode: number = 500) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

interface ErrorResponse {
    error: string;
    details?: string | Record<string, unknown> | undefined;
}

function handlePrismaError(error: PrismaError): AppError {
    switch (error.code) {
        case 'P2002':
            const field = (error.meta?.target as string[])?.join(', ') || 'field';
            return new AppError(`A record with this ${field} already exists`, 400);
        
        case 'P2025':
            return new AppError('Record not found', 404);
        
        case 'P2003':
            return new AppError('Related record does not exist', 400);
        
        case 'P2014':
            return new AppError('Invalid relationship between records', 400);
        
        default:
            return new AppError('Database operation failed', 500);
    }
}

function handleValidationError(error: Error): AppError {
    return new AppError(error.message, 400);
}

export function errorHandler(
    err: Error | AppError | PrismaError,
    req: Request,
    res: Response,
    next: NextFunction
): void {
    let error = err;

    if ('code' in err && typeof (err as PrismaError).code === 'string') {
        error = handlePrismaError(err as PrismaError);
    }

    if (err.message?.includes('Invalid') && err.message?.includes('prisma')) {
        error = new AppError('Invalid data provided', 400);
    }

    if (error instanceof AppError) {
        const response: ErrorResponse = {
            error: error.message,
        };

        if (process.env.NODE_ENV === 'development') {
            response.details = error.stack;
        }

        console.error(`[${error.statusCode}] ${error.message}`, {
            path: req.path,
            method: req.method,
            body: req.body,
        });

        res.status(error.statusCode).json(response);
        return;
    }

    console.error('Unexpected error:', err);
    
    const response: ErrorResponse = {
        error: 'Internal server error',
    };

    if (process.env.NODE_ENV === 'development') {
        response.details = err.message;
    }

    res.status(500).json(response);
}

export function asyncHandler(
    fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

export function notFoundHandler(req: Request, res: Response, next: NextFunction): void {
    const error = new AppError(`Route ${req.originalUrl} not found`, 404);
    next(error);
}
