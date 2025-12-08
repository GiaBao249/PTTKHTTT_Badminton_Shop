import { StatisticsRepository } from "../repositories/StatisticsRepository";
import { RevenueStatistics, ProductStatistics, OrderStatistics, SummaryStatistics, PeriodType } from "../models/Statistics";
export declare class StatisticsService {
    private statisticsRepo;
    constructor(statisticsRepo: StatisticsRepository);
    private getPeriodKey;
    getRevenueStatistics(period?: PeriodType): Promise<RevenueStatistics>;
    getProductStatistics(): Promise<ProductStatistics>;
    getOrderStatistics(): Promise<OrderStatistics>;
    getSummaryStatistics(startDate?: string, endDate?: string): Promise<SummaryStatistics>;
}
//# sourceMappingURL=StatisticsService.d.ts.map