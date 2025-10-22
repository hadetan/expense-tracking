import { Router } from 'express';
import { createExpense } from '../controllers/expenseController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.post('/', authenticateToken, createExpense);

export default router;
