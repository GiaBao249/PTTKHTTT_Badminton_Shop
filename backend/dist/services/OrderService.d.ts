import { OrderRepository } from "../repositories/OrderRepository";
import { Order, OrderDetail, UpdateOrderStatusDto } from "../models/Order";
export declare class OrderService {
    private orderRepo;
    constructor(orderRepo: OrderRepository);
    getRecentOrders(limit?: number): Promise<Order[]>;
    getAllOrders(): Promise<Order[]>;
    /**
     * Lấy order theo ID
     */
    getOrderById(orderId: number): Promise<Order>;
    /**
     * Lấy order details theo order ID
     */
    getOrderDetailsByOrderId(orderId: number): Promise<OrderDetail[]>;
    /**
     * Cập nhật order status với logic trả lại số lượng khi hủy
     */
    updateOrderStatus(updateDto: UpdateOrderStatusDto): Promise<{
        order: Order;
        message: string;
    }>;
    /**
     * Trả lại số lượng sản phẩm vào kho khi hủy đơn
     */
    private restoreProductQuantities;
}
//# sourceMappingURL=OrderService.d.ts.map