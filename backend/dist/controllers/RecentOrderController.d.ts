import { Request, Response } from "express";
import { OrderService } from "../services/OrderService";
export declare class OrderController {
    private orderService;
    constructor(orderService: OrderService);
    getRecentOrders: (req: Request, res: Response) => Promise<void>;
    /**
     * GET /api/admin/getOrders
     */
    getAllOrders: (req: Request, res: Response) => Promise<void>;
    /**
     * GET /api/admin/getOrdersDetail?order_id=
     */
    getOrderDetails: (req: Request, res: Response) => Promise<void>;
    /**
     * PATCH /api/admin/updateOrderStatus
     */
    updateOrderStatus: (req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=RecentOrderController.d.ts.map