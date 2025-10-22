import { describe, it, expect } from '@jest/globals';
import {
    calculateTrendPercentage,
    calculateCategoryPercentage,
    getCurrentMonthRange,
    getPreviousMonthRange,
} from '../../utils/analyticsCalculations.js';

describe('analyticsCalculations', () => {
    describe('calculateTrendPercentage', () => {
        it('should calculate positive trend when current is higher', () => {
            const result = calculateTrendPercentage(150, 100);
            expect(result).toBe(50);
        });

        it('should calculate negative trend when current is lower', () => {
            const result = calculateTrendPercentage(80, 100);
            expect(result).toBe(-20);
        });

        it('should return 100 when previous is 0 and current is positive', () => {
            const result = calculateTrendPercentage(100, 0);
            expect(result).toBe(100);
        });

        it('should return 0 when both values are 0', () => {
            const result = calculateTrendPercentage(0, 0);
            expect(result).toBe(0);
        });

        it('should return 0 when current is 0 but previous was positive', () => {
            const result = calculateTrendPercentage(0, 100);
            expect(result).toBe(-100);
        });

        it('should round to 2 decimal places', () => {
            const result = calculateTrendPercentage(123.45, 100);
            expect(result).toBe(23.45);
        });

        it('should handle decimal percentages correctly', () => {
            const result = calculateTrendPercentage(101, 100);
            expect(result).toBe(1);
        });

        it('should calculate large percentage changes', () => {
            const result = calculateTrendPercentage(1000, 100);
            expect(result).toBe(900);
        });

        it('should handle very small changes', () => {
            const result = calculateTrendPercentage(100.01, 100);
            expect(result).toBe(0.01);
        });
    });

    describe('calculateCategoryPercentage', () => {
        it('should calculate percentage correctly', () => {
            const result = calculateCategoryPercentage(50, 200);
            expect(result).toBe(25);
        });

        it('should return 0 when grand total is 0', () => {
            const result = calculateCategoryPercentage(50, 0);
            expect(result).toBe(0);
        });

        it('should return 100 when category total equals grand total', () => {
            const result = calculateCategoryPercentage(200, 200);
            expect(result).toBe(100);
        });

        it('should round to 2 decimal places', () => {
            const result = calculateCategoryPercentage(33.33, 100);
            expect(result).toBe(33.33);
        });

        it('should handle very small percentages', () => {
            const result = calculateCategoryPercentage(1, 1000);
            expect(result).toBe(0.1);
        });

        it('should handle decimal category totals', () => {
            const result = calculateCategoryPercentage(12.50, 50);
            expect(result).toBe(25);
        });
    });

    describe('getCurrentMonthRange', () => {
        it('should return first day of month to current date', () => {
            const referenceDate = new Date('2024-03-15');
            const result = getCurrentMonthRange(referenceDate);

            expect(result.start.getFullYear()).toBe(2024);
            expect(result.start.getMonth()).toBe(2);
            expect(result.start.getDate()).toBe(1);

            expect(result.end.getFullYear()).toBe(2024);
            expect(result.end.getMonth()).toBe(2);
            expect(result.end.getDate()).toBe(15);
        });

        it('should handle beginning of month', () => {
            const referenceDate = new Date('2024-01-01');
            const result = getCurrentMonthRange(referenceDate);

            expect(result.start.getDate()).toBe(1);
            expect(result.end.getDate()).toBe(1);
        });

        it('should handle end of month', () => {
            const referenceDate = new Date('2024-01-31');
            const result = getCurrentMonthRange(referenceDate);

            expect(result.start.getDate()).toBe(1);
            expect(result.end.getDate()).toBe(31);
        });

        it('should handle February in non-leap year', () => {
            const referenceDate = new Date('2023-02-28');
            const result = getCurrentMonthRange(referenceDate);

            expect(result.start.getMonth()).toBe(1);
            expect(result.start.getDate()).toBe(1);
            expect(result.end.getDate()).toBe(28);
        });

        it('should handle February in leap year', () => {
            const referenceDate = new Date('2024-02-29');
            const result = getCurrentMonthRange(referenceDate);

            expect(result.start.getMonth()).toBe(1);
            expect(result.start.getDate()).toBe(1);
            expect(result.end.getDate()).toBe(29);
        });

        it('should default to current date when no reference provided', () => {
            const result = getCurrentMonthRange();
            const now = new Date();

            expect(result.start.getMonth()).toBe(now.getMonth());
            expect(result.start.getDate()).toBe(1);
        });
    });

    describe('getPreviousMonthRange', () => {
        it('should return previous month range', () => {
            const referenceDate = new Date('2024-03-15');
            const result = getPreviousMonthRange(referenceDate);

            expect(result.start.getFullYear()).toBe(2024);
            expect(result.start.getMonth()).toBe(1);
            expect(result.start.getDate()).toBe(1);

            expect(result.end.getFullYear()).toBe(2024);
            expect(result.end.getMonth()).toBe(1);
            expect(result.end.getDate()).toBe(29);
        });

        it('should handle January (previous month is December of previous year)', () => {
            const referenceDate = new Date('2024-01-15');
            const result = getPreviousMonthRange(referenceDate);

            expect(result.start.getFullYear()).toBe(2023);
            expect(result.start.getMonth()).toBe(11);
            expect(result.start.getDate()).toBe(1);

            expect(result.end.getFullYear()).toBe(2023);
            expect(result.end.getMonth()).toBe(11);
            expect(result.end.getDate()).toBe(31);
        });

        it('should handle months with different days', () => {
            const referenceDate = new Date('2024-05-15');
            const result = getPreviousMonthRange(referenceDate);

            expect(result.start.getMonth()).toBe(3);
            expect(result.start.getDate()).toBe(1);
            expect(result.end.getDate()).toBe(30);
        });

        it('should set end time to end of day (23:59:59)', () => {
            const referenceDate = new Date('2024-03-15');
            const result = getPreviousMonthRange(referenceDate);

            expect(result.end.getHours()).toBe(23);
            expect(result.end.getMinutes()).toBe(59);
            expect(result.end.getSeconds()).toBe(59);
        });

        it('should handle March (previous February in non-leap year)', () => {
            const referenceDate = new Date('2023-03-15');
            const result = getPreviousMonthRange(referenceDate);

            expect(result.start.getMonth()).toBe(1);
            expect(result.end.getDate()).toBe(28);
        });

        it('should handle March (previous February in leap year)', () => {
            const referenceDate = new Date('2024-03-15');
            const result = getPreviousMonthRange(referenceDate);

            expect(result.start.getMonth()).toBe(1);
            expect(result.end.getDate()).toBe(29);
        });

        it('should default to current date when no reference provided', () => {
            const result = getPreviousMonthRange();
            const now = new Date();
            const expectedMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;

            expect(result.start.getMonth()).toBe(expectedMonth);
            expect(result.start.getDate()).toBe(1);
        });
    });
});
