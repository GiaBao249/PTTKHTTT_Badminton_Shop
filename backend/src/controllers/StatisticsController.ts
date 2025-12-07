// controllers/StatisticsController.ts
import { injectable, inject } from "tsyringe";
import { Request, Response } from "express";
import { StatisticsService } from "../services/StatisticsService";
import { AppError } from "../middleware/errorHandler";
import { PeriodType } from "../models/Statistics";

@injectable()
export class StatisticsController {
  constructor(
    @inject(StatisticsService) private statisticsService: StatisticsService
  ) {}

  /**
   * GET /api/admin/statistics/revenue?period=month
   */
  getRevenueStatistics = async (req: Request, res: Response): Promise<void> => {
    try {
      const period = (req.query.period as PeriodType) || "month";
      const stats = await this.statisticsService.getRevenueStatistics(period);
      res.json(stats);
    } catch (error: any) {
      if (error instanceof AppError) {
        res
          .status(error.statusCode)
          .json({ error: error.message, code: error.code });
      } else {
        console.error("Error getting revenue statistics:", error);
        res.status(500).json({ error: "Lỗi khi lấy thống kê doanh thu" });
      }
    }
  };

  /**
   * GET /api/admin/statistics/products
   */
  getProductStatistics = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.statisticsService.getProductStatistics();
      res.json(stats);
    } catch (error: any) {
      if (error instanceof AppError) {
        res
          .status(error.statusCode)
          .json({ error: error.message, code: error.code });
      } else {
        console.error("Error getting product statistics:", error);
        res.status(500).json({ error: "Lỗi khi lấy thống kê sản phẩm" });
      }
    }
  };

  /**
   * GET /api/admin/statistics/orders
   */
  getOrderStatistics = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.statisticsService.getOrderStatistics();
      res.json(stats);
    } catch (error: any) {
      if (error instanceof AppError) {
        res
          .status(error.statusCode)
          .json({ error: error.message, code: error.code });
      } else {
        console.error("Error getting order statistics:", error);
        res.status(500).json({ error: "Lỗi khi lấy thống kê đơn hàng" });
      }
    }
  };

  /**
   * GET /api/admin/statistics/summary?startDate=&endDate=
   */
  getSummaryStatistics = async (req: Request, res: Response): Promise<void> => {
    try {
      const startDate = req.query.startDate as string | undefined;
      const endDate = req.query.endDate as string | undefined;
      const stats = await this.statisticsService.getSummaryStatistics(
        startDate,
        endDate
      );
      res.json(stats);
    } catch (error: any) {
      if (error instanceof AppError) {
        res
          .status(error.statusCode)
          .json({ error: error.message, code: error.code });
      } else {
        console.error("Error getting summary statistics:", error);
        res.status(500).json({ error: "Lỗi khi lấy thống kê tổng hợp" });
      }
    }
  };
}
