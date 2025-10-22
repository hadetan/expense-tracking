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

/**
 * Get expenses with filtering
 * GET /api/expenses
 */
export const getExpenses = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const admin = await prisma.admin.findUnique({
            where: { userId }
        });
        const isAdmin = admin !== null;

        const { status, categoryId, startDate, endDate, dateFilter, page, limit } = req.query;

        const pageNum = page && typeof page === 'string' ? parseInt(page, 10) : 1;
        const limitNum = limit && typeof limit === 'string' ? parseInt(limit, 10) : 10;
        const skip = (pageNum - 1) * limitNum;

        const where: any = {};

        if (!isAdmin) {
            where.userId = userId;
        }

        if (status && typeof status === 'string') {
            where.status = status.toUpperCase();
        }

        if (categoryId && typeof categoryId === 'string') {
            where.categoryId = categoryId;
        }

        if (dateFilter && typeof dateFilter === 'string') {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            switch (dateFilter) {
                case 'today':
                    where.date = {
                        gte: today,
                        lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
                    };
                    break;
                case 'week':
                    const weekAgo = new Date(today);
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    where.date = {
                        gte: weekAgo
                    };
                    break;
                case 'month':
                    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                    where.date = {
                        gte: monthStart
                    };
                    break;
                case 'custom':
                    if (startDate || endDate) {
                        where.date = {};
                        if (startDate && typeof startDate === 'string') {
                            where.date.gte = new Date(startDate);
                        }
                        if (endDate && typeof endDate === 'string') {
                            const endDateTime = new Date(endDate);
                            endDateTime.setHours(23, 59, 59, 999);
                            where.date.lte = endDateTime;
                        }
                    }
                    break;
            }
        } else if (startDate || endDate) {
            where.date = {};
            if (startDate && typeof startDate === 'string') {
                where.date.gte = new Date(startDate);
            }
            if (endDate && typeof endDate === 'string') {
                const endDateTime = new Date(endDate);
                endDateTime.setHours(23, 59, 59, 999);
                where.date.lte = endDateTime;
            }
        }

        const totalCount = await prisma.expense.count({ where });

        const expenses = await prisma.expense.findMany({
            where,
            include: {
                category: true,
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true
                    }
                }
            },
            orderBy: {
                date: 'desc'
            },
            skip,
            take: limitNum
        });

        const totalPages = Math.ceil(totalCount / limitNum);
        const hasNextPage = pageNum < totalPages;
        const hasPreviousPage = pageNum > 1;

        res.json({
            expenses,
            pagination: {
                currentPage: pageNum,
                totalPages,
                totalCount,
                limit: limitNum,
                hasNextPage,
                hasPreviousPage
            }
        });
    } catch (error) {
        console.error('Error fetching expenses:', error);
        res.status(500).json({ error: 'Failed to fetch expenses' });
    }
};

/**
 * Update an existing expense for employee
 * PATCH /api/expenses/:id
 */
export const updateExpense = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { amount, categoryId, description, date } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (!id) {
            return res.status(400).json({ error: 'Expense ID is required' });
        }

        const expense = await prisma.expense.findUnique({
            where: { id }
        });

        if (!expense) {
            return res.status(404).json({ error: 'Expense not found' });
        }

        if (expense.userId !== userId) {
            return res.status(403).json({ error: 'You can only edit your own expenses' });
        }

        if (expense.status === 'APPROVED') {
            return res.status(400).json({ error: 'Cannot edit approved expenses' });
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
        today.setHours(23, 59, 59, 999);
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
            return res.status(400).json({ error: 'Invalid category' });
        }

        const updatedExpense = await prisma.expense.update({
            where: { id },
            data: {
                amount: new Decimal(amountNum),
                categoryId,
                description: description.trim(),
                date: expenseDate,
                status: 'PENDING',
                rejectionReason: null
            },
            include: {
                category: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        res.status(200).json(updatedExpense);
    } catch (error) {
        console.error('Error updating expense:', error);
        res.status(500).json({ error: 'Failed to update expense' });
    }
};
