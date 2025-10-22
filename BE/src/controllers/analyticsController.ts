import type { Request, Response } from 'express';
import prisma from '../utils/lib/prisma.js';
import type { ExpenseGroupByResult, CategoryTotal, AnalyticsData } from '../types/analytics.types.js';

export async function getAnalytics(req: Request, res: Response): Promise<void> {
    try {
        const userId = (req as any).user?.id;

        if (!userId) {
            res.status(401).json({ error: 'User not authenticated' });
            return;
        }

        const admin = await prisma.admin.findUnique({
            where: { userId },
        });

        if (!admin) {
            res.status(403).json({ error: 'Admin access required' });
            return;
        }

        const { startDate, endDate } = req.query;

        const now = new Date();
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const currentMonthEnd = new Date(now);

        const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

        const rangeStart = startDate ? new Date(startDate as string) : currentMonthStart;
        const rangeEnd = endDate ? new Date(endDate as string) : currentMonthEnd;

        const currentMonthExpenses = await prisma.expense.aggregate({
            where: {
                status: 'APPROVED',
                date: {
                    gte: currentMonthStart,
                    lte: currentMonthEnd,
                },
            },
            _sum: {
                amount: true,
            },
        });

        const currentMonthTotal = currentMonthExpenses._sum.amount?.toString() || '0';

        const previousMonthExpenses = await prisma.expense.aggregate({
            where: {
                status: 'APPROVED',
                date: {
                    gte: previousMonthStart,
                    lte: previousMonthEnd,
                },
            },
            _sum: {
                amount: true,
            },
        });

        const previousMonthTotal = previousMonthExpenses._sum.amount?.toString() || '0';

        const currentTotal = parseFloat(currentMonthTotal);
        const previousTotal = parseFloat(previousMonthTotal);
        let trendPercentage = 0;

        if (previousTotal > 0) {
            trendPercentage = ((currentTotal - previousTotal) / previousTotal) * 100;
        } else if (currentTotal > 0) {
            trendPercentage = 100;
        }

        const pendingCount = await prisma.expense.count({
            where: {
                status: 'PENDING',
            },
        });

        const rawCategoryTotals = await prisma.expense.groupBy({
            by: ['categoryId'],
            where: {
                status: 'APPROVED',
                date: {
                    gte: rangeStart,
                    lte: rangeEnd,
                },
            },
            _sum: {
                amount: true,
            },
        });

        const categoryTotals = rawCategoryTotals as unknown as ExpenseGroupByResult[];
        const categoryIds = categoryTotals.map((ct) => ct.categoryId);
        const categories = await prisma.category.findMany({
            where: {
                id: { in: categoryIds },
            },
            select: {
                id: true,
                name: true,
            },
        });

        const grandTotal = categoryTotals.reduce(
            (sum, ct) => sum + parseFloat(ct._sum.amount?.toString() || '0'),
            0
        );

        const totalByCategory: CategoryTotal[] = categoryTotals.map((ct) => {
            const category = categories.find((c) => c.id === ct.categoryId);
            const total = parseFloat(ct._sum.amount?.toString() || '0');
            const percentage = grandTotal > 0 ? (total / grandTotal) * 100 : 0;

            return {
                categoryId: ct.categoryId,
                categoryName: category?.name || 'Unknown',
                total: ct._sum.amount?.toString() || '0',
                percentage: Math.round(percentage * 100) / 100,
            };
        });

        totalByCategory.sort((a, b) => parseFloat(b.total) - parseFloat(a.total));

        const analyticsData: AnalyticsData = {
            currentMonthTotal,
            previousMonthTotal,
            trendPercentage: Math.round(trendPercentage * 100) / 100,
            pendingApprovalsCount: pendingCount,
            totalByCategory,
            dateRange: {
                startDate: rangeStart.toISOString(),
                endDate: rangeEnd.toISOString(),
            },
        };

        res.json(analyticsData);
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
}
