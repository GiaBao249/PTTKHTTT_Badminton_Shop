export declare class CancelOrderRepository {
    /**
     * Lấy order theo ID
     */
    getOrderById(orderId: number): Promise<{
        order_id: number;
        customer_id: number;
        status: string;
    } | null>;
    /**
     * Lấy order details
     */
    getOrderDetails(orderId: number): Promise<Array<{
        product_item_id: number;
        quantity: number;
    }>>;
    /**
     * Lấy quantity của product item
     */
    getProductItemQuantity(productItemId: number): Promise<number | null>;
    /**
     * Cập nhật quantity của product item
     */
    updateProductItemQuantity(productItemId: number, newQuantity: number): Promise<void>;
    /**
     * Cập nhật order status
     */
    updateOrderStatus(orderId: number, status: string): Promise<any>;
}
//# sourceMappingURL=CancelOrderRepository.d.ts.map