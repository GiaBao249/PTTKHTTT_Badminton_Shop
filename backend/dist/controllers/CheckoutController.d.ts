import { Request, Response } from "express";
import { CheckoutService } from "../services/CheckoutService";
export declare class CheckoutController {
    private checkoutService;
    constructor(checkoutService: CheckoutService);
    /**
     * POST /api/checkout/checkout
     * Xử lý checkout
     */
    checkout: (req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=CheckoutController.d.ts.map