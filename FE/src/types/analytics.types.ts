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

export interface ChartDataPoint {
    name: string;
    value: number;
    percentage: number;
    [key: string]: string | number;
}
