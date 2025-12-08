import { CartItem } from "../models/Cart";
export declare class CartRepository {
    /**
     * Lấy cart ID của customer
     */
    getCartIdByCustomerId(customerId: number): Promise<number | null>;
    /**
     * Tạo cart mới
     */
    createCart(customerId: number): Promise<number>;
    /**
     * Lấy cart items với product info
     */
    getCartItems(cartId: number): Promise<CartItem[]>;
    /**
     * Lấy product items với images để lấy thumbnails
     */
    getProductItemsWithImages(productIds: number[]): Promise<Map<number, string>>;
    /**
     * Lấy product item theo ID
     */
    getProductItemById(productItemId: number): Promise<{
        product_id: number;
        quantity: number;
    } | null>;
    /**
     * Lấy product price
     */
    getProductPrice(productId: number): Promise<number | null>;
    /**
     * Lấy cart item hiện có
     */
    getExistingCartItem(cartId: number, productItemId: number): Promise<any | null>;
    /**
     * Thêm cart item
     */
    addCartItem(cartId: number, productItemId: number, quantity: number, totalAmount: number): Promise<any>;
    /**
     * Cập nhật cart item
     */
    updateCartItem(cartId: number, productItemId: number, quantity: number, totalAmount: number): Promise<any>;
    /**
     * Xóa cart item
     */
    deleteCartItem(cartId: number, productItemId: number): Promise<void>;
}
//# sourceMappingURL=CartRepository.d.ts.map