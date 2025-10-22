import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.js';
import prisma from '../utils/lib/prisma.js';

/**
 * Create a new category
 * POST /api/categories
 */
export const createCategory = async (req: AuthRequest, res: Response) => {
  try {
    const { name } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const trimmedName = name.trim();

    const existingCategory = await prisma.category.findFirst({
      where: {
        name: {
          equals: trimmedName,
          mode: 'insensitive'
        },
        createdBy: userId
      }
    });

    if (existingCategory) {
      return res.status(409).json({ error: 'Category already exists' });
    }

    const category = await prisma.category.create({
      data: {
        name: trimmedName,
        createdBy: userId
      }
    });

    res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
};

/**
 * Get all categories
 * GET /api/categories
 */
export const getCategories = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const categories = await prisma.category.findMany({
      where: {
        createdBy: userId
      },
      orderBy: {
        name: 'asc'
      }
    });

    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};
