import { MyOrderRepository } from "../repositories/MyOrderRepository";
import { MyOrder } from "../models/MyOrder";
export declare class MyOrderService {
    private myOrderRepo;
    constructor(myOrderRepo: MyOrderRepository);
    /**
     * Lấy orders của customer với details
     */
    getMyOrders(customerId: number): Promise<MyOrder[]>;
}
//# sourceMappingURL=MyOrderService.d.ts.map