import { CheckoutItem, ShippingInfo } from "../models/Checkout";
export declare class CheckoutRepository {
    /**
     * Lấy product items theo IDs
     */
    getProductItemsByIds(productItemIds: number[]): Promise<Array<{
        product_item_id: number;
        quantity: number;
    }>>;
    /**
     * Tạo địa chỉ mới
     */
    createAddress(customerId: number, shippingInfo: ShippingInfo): Promise<number>;
    /**
     * Tạo order
     */
    createOrder(customerId: number, addressId: number | null, totalAmount: number): Promise<number>;
    /**
     * Tạo order details
     */
    createOrderDetails(orderId: number, cartItems: CheckoutItem[]): Promise<void>;
    /**
     * Cập nhật số lượng product item (trừ inventory)
     */
    updateProductItemQuantity(productItemId: number, newQuantity: number): Promise<void>;
    /**
     * Lấy cart của customer
     */
    getCartByCustomerId(customerId: number): Promise<number | null>;
    /**
     * Xóa cart items
     */
    deleteCartItems(cartId: number, productItemIds: number[]): Promise<void>;
}
//# sourceMappingURL=CheckoutRepository.d.ts.map