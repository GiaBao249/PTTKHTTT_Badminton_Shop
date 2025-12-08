// controllers/OrderController.ts (tạo mới hoặc mở rộng RecentOrderController)
import { injectable, inject } from "tsyringe";
import { Request, Response } from "express";
import { OrderService } from "../services/OrderService";
import { AppError } from "../middleware/errorHandler";

@injectable()
export class OrderController {
  constructor(@inject(OrderService) private orderService: OrderService) {}

  getRecentOrders = async (req: Request, res: Response): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const orders = await this.orderService.getRecentOrders(limit);
      res.json(orders);
    } catch (error: any) {
      if (error instanceof AppError) {
        res
          .status(error.statusCode)
          .json({ error: error.message, code: error.code });
      } else {
        console.error("Error getting recent orders:", error);
        res.status(500).json({ error: "Lỗi server khi lấy đơn hàng gần đây" });
      }
    }
  };

  /**
   * GET /api/admin/getOrders
   */
  getAllOrders = async (req: Request, res: Response): Promise<void> => {
    try {
      const orders = await this.orderService.getAllOrders();
      res.json(orders);
    } catch (error: any) {
      if (error instanceof AppError) {
        res
          .status(error.statusCode)
          .json({ error: error.message, code: error.code });
      } else {
        console.error("Error getting orders:", error);
        res
          .status(500)
          .json({ error: error.message || "Lỗi server khi lấy đơn hàng" });
      }
    }
  };

  /**
   * GET /api/admin/getOrdersDetail?order_id=
   */
  getOrderDetails = async (req: Request, res: Response): Promise<void> => {
    try {
      const orderId = req.query.order_id;

      if (!orderId || typeof orderId !== "string") {
        res.status(400).json({ error: "Thiếu orderId hoặc sai định dạng" });
        return;
      }

      const orderDetails = await this.orderService.getOrderDetailsByOrderId(
        Number(orderId)
      );
      res.json(orderDetails);
    } catch (error: any) {
      if (error instanceof AppError) {
        res
          .status(error.statusCode)
          .json({ error: error.message, code: error.code });
      } else {
        console.error("Error getting order details:", error);
        res.status(500).json({ error: "Lỗi server khi lấy chi tiết đơn hàng" });
      }
    }
  };

  /**
   * PATCH /api/admin/updateOrderStatus
   */
  updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { order_id, status } = req.body;

      const result = await this.orderService.updateOrderStatus({
        order_id,
        status,
      });

      res.json({
        success: true,
        message: result.message,
        order: result.order,
      });
    } catch (error: any) {
      if (error instanceof AppError) {
        res
          .status(error.statusCode)
          .json({ error: error.message, code: error.code });
      } else {
        console.error("Error updating order status:", error);
        res.status(500).json({ error: "Lỗi máy chủ" });
      }
    }
  };
}
