import { injectable, inject } from "tsyringe";
import { Request, Response } from "express";
import { CancelOrderService } from "../services/CancelOrderService";
import { AppError } from "../middleware/errorHandler";

@injectable()
export class CancelOrderController {
  constructor(
    @inject(CancelOrderService) private cancelOrderService: CancelOrderService
  ) {}

  /**
   * PATCH /api/orders/cancel/:orderId
   * Hủy đơn hàng
   */
  cancelOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      const orderId = parseInt(req.params.orderId as string);
      const user = (req as any).user;

      if (!orderId || isNaN(orderId)) {
        res.status(400).json({ error: "Invalid order ID" });
        return;
      }

      if (!user || user.role !== "user") {
        res
          .status(403)
          .json({ error: "Chỉ khách hàng mới có thể hủy đơn hàng" });
        return;
      }

      const result = await this.cancelOrderService.cancelOrder(
        orderId,
        user.id
      );

      console.log("đơn hàng bị hủy bởi khách hàng:", result.order);
      res.json(result);
    } catch (error: any) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          error: error.message,
          code: error.code,
        });
      } else {
        console.error("Server error:", error);
        res.status(500).json({ error: "Lỗi máy chủ" });
      }
    }
  };
}

