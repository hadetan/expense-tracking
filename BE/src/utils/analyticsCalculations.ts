/**
 * Calculate trend percentage between current and previous values
 * @param currentTotal Current period total
 * @param previousTotal Previous period total
 * @returns Percentage change, rounded to 2 decimal places
 */
export function calculateTrendPercentage(currentTotal: number, previousTotal: number): number {
    if (previousTotal > 0) {
        const trend = ((currentTotal - previousTotal) / previousTotal) * 100;
        return Math.round(trend * 100) / 100;
    } else if (currentTotal > 0) {
        return 100;
    }
    return 0;
}

/**
 * Calculate percentage for a category relative to grand total
 * @param categoryTotal Total for this category
 * @param grandTotal Grand total across all categories
 * @returns Percentage, rounded to 2 decimal places
 */
export function calculateCategoryPercentage(categoryTotal: number, grandTotal: number): number {
    if (grandTotal > 0) {
        const percentage = (categoryTotal / grandTotal) * 100;
        return Math.round(percentage * 100) / 100;
    }
    return 0;
}

/**
 * Get the start and end dates for the current month
 * @param referenceDate Optional reference date (defaults to now)
 * @returns Object with start and end dates
 */
export function getCurrentMonthRange(referenceDate: Date = new Date()): { start: Date; end: Date } {
    const start = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
    const end = new Date(referenceDate);
    return { start, end };
}

/**
 * Get the start and end dates for the previous month
 * @param referenceDate Optional reference date (defaults to now)
 * @returns Object with start and end dates
 */
export function getPreviousMonthRange(referenceDate: Date = new Date()): { start: Date; end: Date } {
    const start = new Date(referenceDate.getFullYear(), referenceDate.getMonth() - 1, 1);
    const end = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 0, 23, 59, 59);
    return { start, end };
}
