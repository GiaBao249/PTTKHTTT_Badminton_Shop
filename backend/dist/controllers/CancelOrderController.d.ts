import { Request, Response } from "express";
import { CancelOrderService } from "../services/CancelOrderService";
export declare class CancelOrderController {
    private cancelOrderService;
    constructor(cancelOrderService: CancelOrderService);
    /**
     * PATCH /api/orders/cancel/:orderId
     * Hủy đơn hàng
     */
    cancelOrder: (req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=CancelOrderController.d.ts.map