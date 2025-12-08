export declare class StatisticsRepository {
    getCompletedOrders(): Promise<Array<{
        total_amount: number;
        order_date: string;
    }>>;
    getAllOrders(): Promise<Array<{
        status: string;
        total_amount: number;
        order_date: string;
    }>>;
    getOrderByDateRange(startDate?: string, endDate?: string): Promise<Array<{
        total_amount: number;
        status: string;
        order_date: string;
    }>>;
    getProductsCount(): Promise<number>;
    getProductItems(): Promise<Array<{
        quantity: number;
    }>>;
    getCustomerCount(): Promise<number>;
    getPurchaseOrdersCount(startDate?: string, endDate?: string): Promise<number>;
}
//# sourceMappingURL=StatisticsRepository.d.ts.map