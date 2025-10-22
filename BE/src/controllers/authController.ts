import type { Request, Response } from 'express';
import type { AuthRequest } from '../middleware/auth.js';
import { supabaseAdmin } from '../utils/lib/supabase.js';
import prisma from '../utils/lib/prisma.js';
import getRole from '../utils/getRole.js';

/**
 * Login user with email and password
 * POST /api/auth/login
 */
export async function login(req: Request, res: Response): Promise<void> {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' });
            return;
        }

        const { data, error } = await supabaseAdmin.auth.signInWithPassword({
            email,
            password,
        });

        if (error || !data.user || !data.session) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }

        const user = await prisma.user.findUnique({
            where: { email: data.user.email! },
            include: { admin: true },
        });

        if (!user) {
            res.status(401).json({ error: 'User not found in database' });
            return;
        }

        const role = getRole(user);

        res.cookie('refreshToken', data.session.refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.json({
            accessToken: data.session.access_token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error during login' });
    }
}

/**
 * Logout user (invalidate session)
 * POST /api/auth/logout
 */
export async function logout(req: AuthRequest, res: Response): Promise<void> {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);

            await supabaseAdmin.auth.admin.signOut(token);
        }

        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        });

        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Internal server error during logout' });
    }
}
