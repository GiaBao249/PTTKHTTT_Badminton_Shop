import { injectable, inject } from "tsyringe";
import { Request, Response } from "express";
import { PurchaseOrderService } from "../services/PurchaseOrderService";
import { AppError } from "../middleware/errorHandler";
import { CreatePurchaseOrderDto } from "../models/PurchaseOrder";

@injectable()
export class PurchaseOrderController {
  constructor(
    @inject(PurchaseOrderService)
    private purchaseOrderService: PurchaseOrderService
  ) {}

  /**
   * GET /api/admin/getPurchaseOrders
   * Lấy tất cả purchase orders (GIỮ NGUYÊN endpoint cho frontend)
   */
  getAllPurchaseOrders = async (req: Request, res: Response): Promise<void> => {
    try {
      const purchaseOrders =
        await this.purchaseOrderService.getAllPurchaseOrders();
      res.json(purchaseOrders);
    } catch (error: any) {
      if (error instanceof AppError) {
        res
          .status(error.statusCode)
          .json({ error: error.message, code: error.code });
      } else {
        console.error("Error getting purchase orders:", error);
        res.status(500).json({ error: "Lỗi khi lấy danh sách phiếu nhập" });
      }
    }
  };

  /**
   * GET /api/admin/getPurchaseOrderDetail/:id
   * Lấy purchase order detail (GIỮ NGUYÊN endpoint cho frontend)
   */
  getPurchaseOrderDetail = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const purchaseOrderId = parseInt(req.params.id || "0");
      if (isNaN(purchaseOrderId)) {
        res.status(400).json({ error: "Invalid purchase order ID" });
        return;
      }

      const purchaseOrder =
        await this.purchaseOrderService.getPurchaseOrderById(purchaseOrderId);
      res.json(purchaseOrder);
    } catch (error: any) {
      if (error instanceof AppError) {
        res
          .status(error.statusCode)
          .json({ error: error.message, code: error.code });
      } else {
        console.error("Error getting purchase order detail:", error);
        res.status(500).json({ error: error.message || "Lỗi server" });
      }
    }
  };

  /**
   * POST /api/admin/createPurchaseOrder
   * Tạo purchase order mới (GIỮ NGUYÊN endpoint cho frontend)
   */
  createPurchaseOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      const createDto: CreatePurchaseOrderDto = req.body;
      const purchaseOrder = await this.purchaseOrderService.createPurchaseOrder(
        createDto
      );

      res.status(201).json({
        success: true,
        purchaseOrder,
        message: "Tạo phiếu nhập thành công",
      });
    } catch (error: any) {
      if (error instanceof AppError) {
        res
          .status(error.statusCode)
          .json({ error: error.message, code: error.code });
      } else {
        console.error("Error creating purchase order:", error);
        res.status(500).json({
          error: error.message || "Không thể tạo phiếu nhập",
        });
      }
    }
  };
}
