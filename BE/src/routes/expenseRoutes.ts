import { Router } from 'express';
import { 
    createExpense, 
    getExpenses, 
    updateExpense, 
    approveExpense, 
    rejectExpense,
    bulkUploadExpenses
} from '../controllers/expenseController.js';
import { authenticateToken } from '../middleware/auth.js';
import { upload } from '../utils/upload.js';

const router = Router();

router.post('/', authenticateToken, createExpense);
router.get('/', authenticateToken, getExpenses);
router.patch('/:id', authenticateToken, updateExpense);
router.patch('/:id/approve', authenticateToken, approveExpense);
router.patch('/:id/reject', authenticateToken, rejectExpense);
router.post('/bulk-upload', authenticateToken, upload.single('file'), bulkUploadExpenses);

export default router;
