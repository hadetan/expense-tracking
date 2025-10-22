import { Router } from 'express';
import { login, logout } from '../controllers/authController.js';

const router = Router();

// POST /api/auth/login - Login user
router.post('/login', login);

// POST /api/auth/logout - Logout user
router.post('/logout', logout);

export default router;
