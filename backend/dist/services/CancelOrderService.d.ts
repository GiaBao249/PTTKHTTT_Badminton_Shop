import { CancelOrderRepository } from "../repositories/CancelOrderRepository";
export declare class CancelOrderService {
    private cancelOrderRepo;
    constructor(cancelOrderRepo: CancelOrderRepository);
    /**
     * Hủy đơn hàng
     */
    cancelOrder(orderId: number, customerId: number): Promise<{
        success: boolean;
        message: string;
        order: any;
    }>;
}
//# sourceMappingURL=CancelOrderService.d.ts.map