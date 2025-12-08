import { Order, OrderDetail } from "../models/Order";
export declare class OrderRepository {
    findRecent(limit?: number): Promise<Order[]>;
    findAll(): Promise<Order[]>;
    findById(orderId: number): Promise<Order | null>;
    getOrderDetailsByOrderId(orderId: number): Promise<OrderDetail[]>;
    getOrderStatus(orderId: number): Promise<string | null>;
    updateStatus(orderId: number, status: string): Promise<Order>;
    getProductItemQuantity(productItemId: number): Promise<number | null>;
    updateProductItemQuantity(productItemId: number, newQuantity: number): Promise<void>;
}
//# sourceMappingURL=OrderRepository.d.ts.map