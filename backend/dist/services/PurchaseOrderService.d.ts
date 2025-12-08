import { PurchaseOrderRepository } from "../repositories/PurchaseOrderRepository";
import { PurchaseOrder, CreatePurchaseOrderDto } from "../models/PurchaseOrder";
export declare class PurchaseOrderService {
    private purchaseOrderRepo;
    constructor(purchaseOrderRepo: PurchaseOrderRepository);
    /**
     * Lấy tất cả purchase orders với supplier và employee info
     */
    getAllPurchaseOrders(): Promise<PurchaseOrder[]>;
    /**
     * Lấy purchase order theo ID với details
     */
    getPurchaseOrderById(purchaseOrderId: number): Promise<PurchaseOrder>;
    /**
     * Tạo purchase order mới với logic phức tạp
     */
    createPurchaseOrder(createDto: CreatePurchaseOrderDto): Promise<PurchaseOrder>;
}
//# sourceMappingURL=PurchaseOrderService.d.ts.map