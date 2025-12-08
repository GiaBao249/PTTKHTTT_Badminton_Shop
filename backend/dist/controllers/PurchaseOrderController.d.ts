import { Request, Response } from "express";
import { PurchaseOrderService } from "../services/PurchaseOrderService";
export declare class PurchaseOrderController {
    private purchaseOrderService;
    constructor(purchaseOrderService: PurchaseOrderService);
    /**
     * GET /api/admin/getPurchaseOrders
     * Lấy tất cả purchase orders (GIỮ NGUYÊN endpoint cho frontend)
     */
    getAllPurchaseOrders: (req: Request, res: Response) => Promise<void>;
    /**
     * GET /api/admin/getPurchaseOrderDetail/:id
     * Lấy purchase order detail (GIỮ NGUYÊN endpoint cho frontend)
     */
    getPurchaseOrderDetail: (req: Request, res: Response) => Promise<void>;
    /**
     * POST /api/admin/createPurchaseOrder
     * Tạo purchase order mới (GIỮ NGUYÊN endpoint cho frontend)
     */
    createPurchaseOrder: (req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=PurchaseOrderController.d.ts.map