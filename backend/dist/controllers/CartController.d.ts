import { Request, Response } from "express";
import { CartService } from "../services/CartService";
export declare class CartController {
    private cartService;
    constructor(cartService: CartService);
    /**
     * GET /api/orders/cart/customer/:customerId
     * Lấy cart items của customer
     */
    getCartItems: (req: Request, res: Response) => Promise<void>;
    /**
     * POST /api/orders/cart/add
     * Thêm item vào cart
     */
    addToCart: (req: Request, res: Response) => Promise<void>;
    /**
     * PUT /api/orders/cart/update
     * Cập nhật cart item
     */
    updateCartItem: (req: Request, res: Response) => Promise<void>;
    /**
     * DELETE /api/orders/cart/delete
     * Xóa cart item
     */
    deleteCartItem: (req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=CartController.d.ts.map