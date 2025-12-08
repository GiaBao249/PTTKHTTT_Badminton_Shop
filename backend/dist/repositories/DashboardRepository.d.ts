export declare class DashboardRepository {
    getOrdersForStats(): Promise<Array<{
        total_amount: number;
        status: string;
    }>>;
    getTotalCustomers(): Promise<number>;
    getTotalProducts(): Promise<number>;
    getAllStatsData(): Promise<{
        orders: Array<{
            total_amount: number;
            status: string;
        }>;
        totalCustomers: number;
        totalProducts: number;
    }>;
}
//# sourceMappingURL=DashboardRepository.d.ts.map