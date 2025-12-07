import { injectable, inject } from "tsyringe";
import { Request, Response } from "express";
import { MyOrderService } from "../services/MyOrderService";
import { AppError } from "../middleware/errorHandler";

@injectable()
export class MyOrderController {
  constructor(
    @inject(MyOrderService) private myOrderService: MyOrderService
  ) {}

  /**
   * GET /api/orders/customer/:id
   * Lấy orders của customer
   */
  getMyOrders = async (req: Request, res: Response): Promise<void> => {
    try {
      const idParam = req.params.id;
      if (!idParam) {
        res.status(400).json({ error: "Customer ID is required" });
        return;
      }

      const customerId = parseInt(idParam, 10);
      if (isNaN(customerId)) {
        res.status(400).json({ error: "Invalid customer ID" });
        return;
      }

      const user = (req as any).user;
      if (user.role === "user" && user.id !== customerId) {
        res.status(403).json({ error: "không có quyền truy cập" });
        return;
      }

      const orders = await this.myOrderService.getMyOrders(customerId);
      res.json(orders);
    } catch (error: any) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          error: error.message,
          code: error.code,
        });
      } else {
        console.error("Lỗi khi lấy đơn hàng:", error);
        res.status(500).json({ error: "Lỗi server" });
      }
    }
  };
}

