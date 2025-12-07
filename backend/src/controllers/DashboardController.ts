import { injectable, inject } from "tsyringe";
import { Request, Response } from "express";
import { DashboardService } from "../services/DashboardService";
import { AppError } from "../middleware/errorHandler";

@injectable()
export class DashboardController {
  constructor(
    @inject(DashboardService) private dashboardService: DashboardService
  ) {}

  getDashboardStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.dashboardService.getDashboardStats();
      res.json(stats);
    } catch (error: any) {
      if (error instanceof AppError) {
        res
          .status(error.statusCode)
          .json({ error: error.message, code: error.code });
      } else {
        console.error("Error getting dashboard stats:", error);
        res.status(500).json({ error: "Lỗi server khi lấy thống kê" });
      }
    }
  };
}
