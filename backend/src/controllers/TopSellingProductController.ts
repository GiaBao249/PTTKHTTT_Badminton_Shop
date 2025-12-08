import { injectable, inject } from "tsyringe";
import { Request, Response } from "express";
import { TopSellingProductService } from "../services/TopSellingProductService";
import { AppError } from "../middleware/errorHandler";

@injectable()
export class TopSellingProductController {
  constructor(
    @inject(TopSellingProductService)
    private topSellingProductService: TopSellingProductService
  ) {}
  getTopSellingProducts = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const products =
        await this.topSellingProductService.getTopSellingProducts(limit);
      res.json(products);
    } catch (error: any) {
      if (error instanceof AppError) {
        res
          .status(error.statusCode)
          .json({ error: error.message, code: error.code });
      } else {
        console.error("Error getting top selling products:", error);
        res.status(500).json({ error: "Lỗi khi lấy sản phẩm bán chạy" });
      }
    }
  };
}
