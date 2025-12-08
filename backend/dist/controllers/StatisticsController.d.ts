import { Request, Response } from "express";
import { StatisticsService } from "../services/StatisticsService";
export declare class StatisticsController {
    private statisticsService;
    constructor(statisticsService: StatisticsService);
    /**
     * GET /api/admin/statistics/revenue?period=month
     */
    getRevenueStatistics: (req: Request, res: Response) => Promise<void>;
    /**
     * GET /api/admin/statistics/products
     */
    getProductStatistics: (req: Request, res: Response) => Promise<void>;
    /**
     * GET /api/admin/statistics/orders
     */
    getOrderStatistics: (req: Request, res: Response) => Promise<void>;
    /**
     * GET /api/admin/statistics/summary?startDate=&endDate=
     */
    getSummaryStatistics: (req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=StatisticsController.d.ts.map