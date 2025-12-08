import { CheckoutRepository } from "../repositories/CheckoutRepository";
import { CheckoutDto, CheckoutResponse } from "../models/Checkout";
export declare class CheckoutService {
    private checkoutRepo;
    constructor(checkoutRepo: CheckoutRepository);
    /**
     * Xử lý checkout
     */
    checkout(customerId: number, checkoutDto: CheckoutDto): Promise<CheckoutResponse>;
    /**
     * Trừ inventory và xóa cart items
     */
    private processInventoryAndCart;
}
//# sourceMappingURL=CheckoutService.d.ts.map