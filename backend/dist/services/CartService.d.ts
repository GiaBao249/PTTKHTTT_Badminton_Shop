import { CartRepository } from "../repositories/CartRepository";
import { CartItem, AddToCartDto, UpdateCartDto, DeleteCartItemDto, CartResponse } from "../models/Cart";
export declare class CartService {
    private cartRepo;
    constructor(cartRepo: CartRepository);
    /**
     * Lấy cart items của customer
     */
    getCartItems(customerId: number): Promise<CartItem[]>;
    /**
     * Thêm item vào cart
     */
    addToCart(customerId: number, addDto: AddToCartDto): Promise<CartResponse>;
    /**
     * Cập nhật cart item
     */
    updateCartItem(customerId: number, updateDto: UpdateCartDto): Promise<CartResponse>;
    /**
     * Xóa cart item
     */
    deleteCartItem(customerId: number, deleteDto: DeleteCartItemDto): Promise<CartResponse>;
}
//# sourceMappingURL=CartService.d.ts.map