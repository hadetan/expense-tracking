import { describe, it, expect } from '@jest/globals';

describe('Expense Validation Tests', () => {
    describe('Amount validation', () => {
        const validateAmount = (amount: any): { valid: boolean; error?: string } => {
            if (amount === undefined || amount === null || amount === '') {
                return { valid: false, error: 'Amount is required' };
            }

            const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

            if (isNaN(numAmount)) {
                return { valid: false, error: 'Amount must be a valid number' };
            }

            if (numAmount <= 0) {
                return { valid: false, error: 'Amount must be greater than 0' };
            }

            return { valid: true };
        };

        it('should accept valid positive amounts', () => {
            expect(validateAmount(100).valid).toBe(true);
            expect(validateAmount(0.01).valid).toBe(true);
            expect(validateAmount('50.99').valid).toBe(true);
            expect(validateAmount(1000000).valid).toBe(true);
        });

        it('should reject negative amounts', () => {
            const result = validateAmount(-50);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('greater than 0');
        });

        it('should reject zero amount', () => {
            const result = validateAmount(0);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('greater than 0');
        });

        it('should reject empty or missing amounts', () => {
            expect(validateAmount('').valid).toBe(false);
            expect(validateAmount(null).valid).toBe(false);
            expect(validateAmount(undefined).valid).toBe(false);
        });

        it('should reject non-numeric amounts', () => {
            const result = validateAmount('not a number');
            expect(result.valid).toBe(false);
            expect(result.error).toContain('valid number');
        });
    });

    describe('Description validation', () => {
        const validateDescription = (description: any): { valid: boolean; error?: string } => {
            if (!description || typeof description !== 'string') {
                return { valid: false, error: 'Description is required' };
            }

            const trimmed = description.trim();
            if (trimmed.length === 0) {
                return { valid: false, error: 'Description cannot be empty' };
            }

            if (trimmed.length > 500) {
                return { valid: false, error: 'Description must be less than 500 characters' };
            }

            return { valid: true };
        };

        it('should accept valid descriptions', () => {
            expect(validateDescription('Taxi fare').valid).toBe(true);
            expect(validateDescription('Team lunch at restaurant').valid).toBe(true);
            expect(validateDescription('A'.repeat(500)).valid).toBe(true);
        });

        it('should reject empty descriptions', () => {
            expect(validateDescription('').valid).toBe(false);
            expect(validateDescription('   ').valid).toBe(false);
            expect(validateDescription(null).valid).toBe(false);
            expect(validateDescription(undefined).valid).toBe(false);
        });

        it('should reject descriptions that are too long', () => {
            const longDesc = 'A'.repeat(501);
            const result = validateDescription(longDesc);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('500 characters');
        });
    });

    describe('Date validation', () => {
        const validateDate = (date: any): { valid: boolean; error?: string } => {
            if (!date) {
                return { valid: false, error: 'Date is required' };
            }

            const parsedDate = new Date(date);
            if (isNaN(parsedDate.getTime())) {
                return { valid: false, error: 'Invalid date format' };
            }

            const now = new Date();
            if (parsedDate > now) {
                return { valid: false, error: 'Date cannot be in the future' };
            }

            return { valid: true };
        };

        it('should accept valid past dates', () => {
            expect(validateDate('2024-01-15').valid).toBe(true);
            expect(validateDate('2023-12-25').valid).toBe(true);
            expect(validateDate(new Date('2024-01-01')).valid).toBe(true);
        });

        it('should accept today\'s date', () => {
            const today = new Date().toISOString().split('T')[0];
            expect(validateDate(today!).valid).toBe(true);
        });

        it('should reject future dates', () => {
            const futureDate = new Date();
            futureDate.setFullYear(futureDate.getFullYear() + 1);
            const result = validateDate(futureDate);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('future');
        });

        it('should reject invalid date formats', () => {
            expect(validateDate('not-a-date').valid).toBe(false);
            expect(validateDate('').valid).toBe(false);
            expect(validateDate(null).valid).toBe(false);
        });
    });

    describe('Category validation', () => {
        const validateCategory = (categoryId: any): { valid: boolean; error?: string } => {
            if (!categoryId) {
                return { valid: false, error: 'Category is required' };
            }

            if (typeof categoryId !== 'string' && typeof categoryId !== 'number') {
                return { valid: false, error: 'Invalid category ID' };
            }

            return { valid: true };
        };

        it('should accept valid category IDs', () => {
            expect(validateCategory('cat-123').valid).toBe(true);
            expect(validateCategory(123).valid).toBe(true);
        });

        it('should reject missing category', () => {
            expect(validateCategory('').valid).toBe(false);
            expect(validateCategory(null).valid).toBe(false);
            expect(validateCategory(undefined).valid).toBe(false);
        });
    });

    describe('Status validation', () => {
        const validateStatus = (status: any): { valid: boolean; error?: string } => {
            const validStatuses = ['PENDING', 'APPROVED', 'REJECTED'];

            if (!status) {
                return { valid: false, error: 'Status is required' };
            }

            if (!validStatuses.includes(status)) {
                return { valid: false, error: 'Invalid status value' };
            }

            return { valid: true };
        };

        it('should accept valid status values', () => {
            expect(validateStatus('PENDING').valid).toBe(true);
            expect(validateStatus('APPROVED').valid).toBe(true);
            expect(validateStatus('REJECTED').valid).toBe(true);
        });

        it('should reject invalid status values', () => {
            expect(validateStatus('INVALID').valid).toBe(false);
            expect(validateStatus('pending').valid).toBe(false);
            expect(validateStatus('').valid).toBe(false);
            expect(validateStatus(null).valid).toBe(false);
        });
    });

    describe('Rejection reason validation', () => {
        const validateRejectionReason = (
            status: string,
            reason: any
        ): { valid: boolean; error?: string } => {
            if (status === 'REJECTED') {
                if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
                    return { valid: false, error: 'Rejection reason is required when status is REJECTED' };
                }
            }
            return { valid: true };
        };

        it('should require rejection reason when status is REJECTED', () => {
            const result = validateRejectionReason('REJECTED', '');
            expect(result.valid).toBe(false);
            expect(result.error).toContain('Rejection reason is required');
        });

        it('should accept rejection reason for REJECTED status', () => {
            expect(validateRejectionReason('REJECTED', 'Invalid receipt').valid).toBe(true);
        });

        it('should not require reason for other statuses', () => {
            expect(validateRejectionReason('APPROVED', null).valid).toBe(true);
            expect(validateRejectionReason('PENDING', null).valid).toBe(true);
        });
    });
});
