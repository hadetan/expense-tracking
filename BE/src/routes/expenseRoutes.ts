import { Router } from 'express';
import { createExpense, getExpenses, updateExpense } from '../controllers/expenseController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.post('/', authenticateToken, createExpense);
router.get('/', authenticateToken, getExpenses);
router.patch('/:id', authenticateToken, updateExpense);

export default router;
