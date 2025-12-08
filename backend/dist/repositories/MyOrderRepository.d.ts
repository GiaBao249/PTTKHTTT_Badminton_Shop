import { MyOrder } from "../models/MyOrder";
export declare class MyOrderRepository {
    /**
     * Lấy orders của customer
     */
    getOrdersByCustomerId(customerId: number): Promise<MyOrder[]>;
    /**
     * Lấy order details theo order IDs
     */
    getOrderDetailsByOrderIds(orderIds: number[]): Promise<Array<{
        order_id: number;
        product_item_id: number;
        quantity: number;
    }>>;
    /**
     * Lấy product items với product info
     */
    getProductItemsWithProducts(productItemIds: number[]): Promise<any[]>;
}
//# sourceMappingURL=MyOrderRepository.d.ts.map