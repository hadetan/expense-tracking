import type { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../utils/lib/supabase.js';

export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
    };
}

/**
 * Middleware to verify Supabase JWT token and attach user to request
 */
export async function authenticateToken(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'Missing or invalid authorization header' });
            return;
        }

        const token = authHeader.substring(7);

        const {
            data: { user },
            error,
        } = await supabaseAdmin.auth.getUser(token);

        if (error || !user) {
            res.status(401).json({ error: 'Invalid or expired token' });
            return;
        }

        req.user = {
            id: user.id,
            email: user.email!,
        };

        next();
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(500).json({ error: 'Internal server error during authentication' });
    }
}
