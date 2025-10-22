export interface ExpenseGroupByResult {
    categoryId: string;
    _sum: {
        amount: {
            toString(): string;
        } | null;
    };
}

export interface CategoryTotal {
    categoryId: string;
    categoryName: string;
    total: string;
    percentage: number;
}

export interface AnalyticsData {
    currentMonthTotal: string;
    previousMonthTotal: string;
    trendPercentage: number;
    pendingApprovalsCount: number;
    totalByCategory: CategoryTotal[];
    dateRange: {
        startDate: string;
        endDate: string;
    };
}
