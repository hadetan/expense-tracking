import { describe, it, expect } from '@jest/globals';
import { parseDateDDMMYYYY, validateExpenseRow } from '../../utils/fileParser.js';
import type { ParsedExpenseRow } from '../../utils/fileParser.js';

describe('fileParser utils', () => {
    describe('parseDateDDMMYYYY', () => {
        it('should parse valid dd-mm-yyyy date', () => {
            const result = parseDateDDMMYYYY('15-03-2024');
            expect(result).not.toBeNull();
            const date = new Date(result!);
            expect(date.getDate()).toBe(15);
            expect(date.getMonth()).toBe(2);
            expect(date.getFullYear()).toBe(2024);
        });

        it('should parse valid dd/mm/yyyy date with slashes', () => {
            const result = parseDateDDMMYYYY('25/12/2023');
            expect(result).not.toBeNull();
            const date = new Date(result!);
            expect(date.getDate()).toBe(25);
            expect(date.getMonth()).toBe(11);
            expect(date.getFullYear()).toBe(2023);
        });

        it('should handle single-digit days and months', () => {
            const result = parseDateDDMMYYYY('5-3-2024');
            expect(result).not.toBeNull();
            const date = new Date(result!);
            expect(date.getDate()).toBe(5);
            expect(date.getMonth()).toBe(2);
        });

        it('should return null for invalid format (not 3 parts)', () => {
            expect(parseDateDDMMYYYY('15-03')).toBeNull();
            expect(parseDateDDMMYYYY('15')).toBeNull();
            expect(parseDateDDMMYYYY('15-03-2024-01')).toBeNull();
        });

        it('should return null for non-numeric values', () => {
            expect(parseDateDDMMYYYY('abc-03-2024')).toBeNull();
            expect(parseDateDDMMYYYY('15-xyz-2024')).toBeNull();
            expect(parseDateDDMMYYYY('15-03-abcd')).toBeNull();
        });

        it('should return null for invalid day', () => {
            expect(parseDateDDMMYYYY('0-03-2024')).toBeNull();
            expect(parseDateDDMMYYYY('32-03-2024')).toBeNull();
        });

        it('should return null for invalid month', () => {
            expect(parseDateDDMMYYYY('15-0-2024')).toBeNull();
            expect(parseDateDDMMYYYY('15-13-2024')).toBeNull();
        });

        it('should return null for invalid date (e.g., Feb 30)', () => {
            expect(parseDateDDMMYYYY('30-02-2024')).toBeNull();
            expect(parseDateDDMMYYYY('31-04-2024')).toBeNull();
        });

        it('should handle leap year correctly', () => {
            const result = parseDateDDMMYYYY('29-02-2024');
            expect(result).not.toBeNull();

            expect(parseDateDDMMYYYY('29-02-2023')).toBeNull();
        });

        it('should trim whitespace', () => {
            const result = parseDateDDMMYYYY('  15-03-2024  ');
            expect(result).not.toBeNull();
            const date = new Date(result!);
            expect(date.getDate()).toBe(15);
        });
    });

    describe('validateExpenseRow', () => {
        const validRow: ParsedExpenseRow = {
            date: '15-03-2024',
            amount: '100.50',
            category: 'Travel',
            description: 'Taxi fare to client meeting',
        };

        it('should return no errors for valid row', () => {
            const errors = validateExpenseRow(validRow, 1);
            expect(errors).toHaveLength(0);
        });

        it('should validate amount is required', () => {
            const invalidRow = { ...validRow, amount: '' };
            const errors = validateExpenseRow(invalidRow, 1);
            expect(errors).toHaveLength(1);
            expect(errors[0]!.field).toBe('amount');
            expect(errors[0]!.message).toContain('required');
        });

        it('should validate amount is a number', () => {
            const invalidRow = { ...validRow, amount: 'not a number' };
            const errors = validateExpenseRow(invalidRow, 1);
            expect(errors).toHaveLength(1);
            expect(errors[0]!.field).toBe('amount');
            expect(errors[0]!.message).toContain('valid number');
        });

        it('should validate amount is positive', () => {
            const invalidRow = { ...validRow, amount: '-50' };
            const errors = validateExpenseRow(invalidRow, 1);
            expect(errors).toHaveLength(1);
            expect(errors[0]!.field).toBe('amount');
            expect(errors[0]!.message).toContain('greater than 0');
        });

        it('should validate amount is not zero', () => {
            const invalidRow = { ...validRow, amount: '0' };
            const errors = validateExpenseRow(invalidRow, 1);
            expect(errors).toHaveLength(1);
            expect(errors[0]!.field).toBe('amount');
            expect(errors[0]!.message).toContain('greater than 0');
        });

        it('should validate date is required', () => {
            const invalidRow = { ...validRow, date: '' };
            const errors = validateExpenseRow(invalidRow, 1);
            expect(errors).toHaveLength(1);
            expect(errors[0]!.field).toBe('date');
            expect(errors[0]!.message).toContain('required');
        });

        it('should validate date format', () => {
            const invalidRow = { ...validRow, date: '2024-03-15' };
            const errors = validateExpenseRow(invalidRow, 1);
            expect(errors).toHaveLength(1);
            expect(errors[0]!.field).toBe('date');
            expect(errors[0]!.message).toContain('Invalid date format');
        });

        it('should validate date is not in future', () => {
            const futureDate = new Date();
            futureDate.setFullYear(futureDate.getFullYear() + 1);
            const dd = String(futureDate.getDate()).padStart(2, '0');
            const mm = String(futureDate.getMonth() + 1).padStart(2, '0');
            const yyyy = futureDate.getFullYear();

            const invalidRow = { ...validRow, date: `${dd}-${mm}-${yyyy}` };
            const errors = validateExpenseRow(invalidRow, 1);
            expect(errors).toHaveLength(1);
            expect(errors[0]!.field).toBe('date');
            expect(errors[0]!.message).toContain('future');
        });

        it('should validate category is required', () => {
            const invalidRow = { ...validRow, category: '' };
            const errors = validateExpenseRow(invalidRow, 1);
            expect(errors).toHaveLength(1);
            expect(errors[0]!.field).toBe('category');
            expect(errors[0]!.message).toContain('required');
        });

        it('should validate description is required', () => {
            const invalidRow = { ...validRow, description: '' };
            const errors = validateExpenseRow(invalidRow, 1);
            expect(errors).toHaveLength(1);
            expect(errors[0]!.field).toBe('description');
            expect(errors[0]!.message).toContain('required');
        });

        it('should validate description length', () => {
            const longDescription = 'a'.repeat(501);
            const invalidRow = { ...validRow, description: longDescription };
            const errors = validateExpenseRow(invalidRow, 1);
            expect(errors).toHaveLength(1);
            expect(errors[0]!.field).toBe('description');
            expect(errors[0]!.message).toContain('500 characters');
        });

        it('should return multiple errors for multiple invalid fields', () => {
            const invalidRow: ParsedExpenseRow = {
                date: '',
                amount: '-10',
                category: '',
                description: '',
            };
            const errors = validateExpenseRow(invalidRow, 1);
            expect(errors.length).toBeGreaterThanOrEqual(4);

            const fields = errors.map(e => e.field);
            expect(fields).toContain('date');
            expect(fields).toContain('amount');
            expect(fields).toContain('category');
            expect(fields).toContain('description');
        });

        it('should include correct row number in errors', () => {
            const invalidRow = { ...validRow, amount: '' };
            const errors = validateExpenseRow(invalidRow, 42);
            expect(errors[0]!.row).toBe(42);
        });

        it('should trim whitespace from fields', () => {
            const rowWithWhitespace: ParsedExpenseRow = {
                date: '  15-03-2024  ',
                amount: '  100.50  ',
                category: '  Travel  ',
                description: '  Valid description  ',
            };
            const errors = validateExpenseRow(rowWithWhitespace, 1);
            expect(errors).toHaveLength(0);
        });
    });
});
