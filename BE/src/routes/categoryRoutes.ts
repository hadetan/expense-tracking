import { Router } from 'express';
import { createCategory, getCategories } from '../controllers/categoryController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.post('/', authenticateToken, createCategory);
router.get('/', authenticateToken, getCategories);

export default router;
