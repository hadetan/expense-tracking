import type { Response, NextFunction } from 'express';
import type { AuthRequest } from './auth.js';
import prisma from '../utils/lib/prisma.js';

/**
 * Middleware to check if authenticated user is an admin
 */
export async function requireAdmin(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        const user = await prisma.user.findUnique({
            where: { email: req.user.email },
            include: { admin: true },
        });

        if (!user) {
            res.status(403).json({ error: 'User not found in database' });
            return;
        }

        if (!user.admin) {
            res.status(403).json({ error: 'Admin access required' });
            return;
        }

        next();
    } catch (error) {
        console.error('Admin check error:', error);
        res.status(500).json({ error: 'Internal server error during authorization' });
    }
}
