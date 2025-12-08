import { Request, Response } from "express";
import { MyOrderService } from "../services/MyOrderService";
export declare class MyOrderController {
    private myOrderService;
    constructor(myOrderService: MyOrderService);
    /**
     * GET /api/orders/customer/:id
     * Lấy orders của customer
     */
    getMyOrders: (req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=MyOrderController.d.ts.map