import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.js';
import prisma from '../utils/lib/prisma.js';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * Create a new expense
 * POST /api/expenses
 */
export const createExpense = async (req: AuthRequest, res: Response) => {
    try {
        const { amount, categoryId, description, date } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (!amount || !categoryId || !description || !date) {
            return res.status(400).json({
                error: 'All fields are required: amount, categoryId, description, date'
            });
        }

        const amountNum = parseFloat(amount);
        if (isNaN(amountNum) || amountNum <= 0) {
            return res.status(400).json({ error: 'Amount must be a positive number' });
        }

        if (typeof description !== 'string' || description.trim().length === 0) {
            return res.status(400).json({ error: 'Description is required' });
        }
        if (description.length > 500) {
            return res.status(400).json({ error: 'Description must not exceed 500 characters' });
        }

        const expenseDate = new Date(date);
        if (isNaN(expenseDate.getTime())) {
            return res.status(400).json({ error: 'Invalid date format' });
        }

        const today = new Date();
        today.setHours(23, 59, 59, 999); /* End of today */
        if (expenseDate > today) {
            return res.status(400).json({ error: 'Expense date cannot be in the future' });
        }

        const category = await prisma.category.findFirst({
            where: {
                id: categoryId,
                createdBy: userId
            }
        });

        if (!category) {
            return res.status(400).json({ error: 'Invalid category. Category does not exist or does not belong to you.' });
        }

        const expense = await prisma.expense.create({
            data: {
                amount: new Decimal(amountNum.toFixed(2)),
                categoryId,
                description: description.trim(),
                date: expenseDate,
                userId,
                status: 'PENDING'
            },
            include: {
                category: true
            }
        });

        res.status(201).json(expense);
    } catch (error) {
        console.error('Error creating expense:', error);
        res.status(500).json({ error: 'Failed to create expense' });
    }
};
