import csv from 'csv-parser';
import xlsx from 'xlsx';
import { Readable } from 'stream';

export interface ParsedExpenseRow {
    date: string;
    amount: string;
    category: string;
    description: string;
}

export interface ValidationError {
    row: number;
    field: string;
    message: string;
}

/**
 * Convert dd-mm-yyyy date string to ISO format
 */
export function parseDateDDMMYYYY(dateStr: string): string | null {
    const parts = dateStr.trim().split(/[-/]/);
    if (parts.length !== 3) return null;

    const day = parseInt(parts[0]!, 10);
    const month = parseInt(parts[1]!, 10);
    const year = parseInt(parts[2]!, 10);

    if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
    if (day < 1 || day > 31 || month < 1 || month > 12) return null;

    const date = new Date(year, month - 1, day);

    if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
        return null;
    }

    return date.toISOString();
}

/**
 * Validate a single expense row
 */
export function validateExpenseRow(row: ParsedExpenseRow, rowNumber: number): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!row.date || row.date.trim() === '') {
        errors.push({ row: rowNumber, field: 'date', message: 'Date is required' });
    } else {
        const isoDate = parseDateDDMMYYYY(row.date);
        if (!isoDate) {
            errors.push({ row: rowNumber, field: 'date', message: 'Invalid date format. Expected dd-mm-yyyy' });
        } else {
            const date = new Date(isoDate);
            const now = new Date();
            if (date > now) {
                errors.push({ row: rowNumber, field: 'date', message: 'Date cannot be in the future' });
            }
        }
    }

    if (!row.amount || row.amount.trim() === '') {
        errors.push({ row: rowNumber, field: 'amount', message: 'Amount is required' });
    } else {
        const amount = parseFloat(row.amount);
        if (isNaN(amount)) {
            errors.push({ row: rowNumber, field: 'amount', message: 'Amount must be a valid number' });
        } else if (amount <= 0) {
            errors.push({ row: rowNumber, field: 'amount', message: 'Amount must be greater than 0' });
        }
    }

    if (!row.category || row.category.trim() === '') {
        errors.push({ row: rowNumber, field: 'category', message: 'Category is required' });
    }

    if (!row.description || row.description.trim() === '') {
        errors.push({ row: rowNumber, field: 'description', message: 'Description is required' });
    } else if (row.description.length > 500) {
        errors.push({ row: rowNumber, field: 'description', message: 'Description must not exceed 500 characters' });
    }

    return errors;
}

/**
 * Parse CSV file buffer
 */
export async function parseCSV(fileBuffer: Buffer): Promise<ParsedExpenseRow[]> {
    return new Promise((resolve, reject) => {
        const results: ParsedExpenseRow[] = [];
        const stream = Readable.from(fileBuffer);

        stream
            .pipe(csv({
                mapHeaders: ({ header }: { header: string }) => header.trim().toLowerCase()
            }))
            .on('data', (data: any) => {
                results.push({
                    date: data.date || '',
                    amount: data.amount || '',
                    category: data.category || '',
                    description: data.description || '',
                });
            })
            .on('end', () => {
                resolve(results);
            })
            .on('error', (error: Error) => {
                reject(error);
            });
    });
}

/**
 * Parse Excel file buffer
 */
export function parseExcel(fileBuffer: Buffer): ParsedExpenseRow[] {
    const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    
    if (!sheetName) {
        throw new Error('Excel file has no sheets');
    }

    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) {
        throw new Error('Could not read worksheet');
    }

    const jsonData: any[] = xlsx.utils.sheet_to_json(worksheet, { defval: '' });

    return jsonData.map((row: any) => ({
        date: (row.Date || row.date || '').toString().trim(),
        amount: (row.Amount || row.amount || '').toString().trim(),
        category: (row.Category || row.category || '').toString().trim(),
        description: (row.Description || row.description || '').toString().trim(),
    }));
}

/**
 * Parse file based on mimetype or extension
 */
export async function parseExpenseFile(fileBuffer: Buffer, mimetype: string): Promise<ParsedExpenseRow[]> {
    if (mimetype === 'text/csv' || mimetype === 'application/csv') {
        return await parseCSV(fileBuffer);
    } else if (
        mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        mimetype === 'application/vnd.ms-excel'
    ) {
        return parseExcel(fileBuffer);
    } else {
        throw new Error('Unsupported file type. Please upload CSV or Excel file.');
    }
}
