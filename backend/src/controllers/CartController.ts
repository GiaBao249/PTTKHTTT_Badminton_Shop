import { injectable, inject } from "tsyringe";
import { Request, Response } from "express";
import { CartService } from "../services/CartService";
import { AddToCartDto, UpdateCartDto, DeleteCartItemDto } from "../models/Cart";
import { AppError } from "../middleware/errorHandler";

@injectable()
export class CartController {
  constructor(@inject(CartService) private cartService: CartService) {}

  /**
   * GET /api/orders/cart/customer/:customerId
   * Lấy cart items của customer
   */
  getCartItems = async (req: Request, res: Response): Promise<void> => {
    try {
      const customerId = parseInt(req.params.customerId || "0");
      if (isNaN(customerId)) {
        res.status(400).json({ error: "Invalid customer ID" });
        return;
      }

      const cartItems = await this.cartService.getCartItems(customerId);
      res.json(cartItems);
    } catch (error: any) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          error: error.message,
          code: error.code,
        });
      } else {
        console.error("Error getting cart items:", error);
        res.status(400).json({
          error: error.message || "Lỗi server",
        });
      }
    }
  };

  /**
   * POST /api/orders/cart/add
   * Thêm item vào cart
   */
  addToCart = async (req: Request, res: Response): Promise<void> => {
    try {
      const customerId = (req as any).user?.id;
      if (!customerId) {
        res.status(401).json({ error: "Chưa đăng nhập" });
        return;
      }

      const addDto: AddToCartDto = req.body;
      const result = await this.cartService.addToCart(customerId, addDto);
      res.json(result);
    } catch (error: any) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          error: error.message,
          code: error.code,
        });
      } else {
        console.error("Error adding to cart:", error);
        res.status(400).json({
          error: error.message || "Lỗi server",
        });
      }
    }
  };

  /**
   * PUT /api/orders/cart/update
   * Cập nhật cart item
   */
  updateCartItem = async (req: Request, res: Response): Promise<void> => {
    try {
      const customerId = (req as any).user?.id;
      if (!customerId) {
        res.status(401).json({ error: "Chưa đăng nhập" });
        return;
      }

      const updateDto: UpdateCartDto = req.body;
      const result = await this.cartService.updateCartItem(
        customerId,
        updateDto
      );
      res.json(result);
    } catch (error: any) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          error: error.message,
          code: error.code,
        });
      } else {
        console.error("Error updating cart:", error);
        res.status(400).json({
          error: error.message || "Lỗi cập nhật giỏ hàng",
        });
      }
    }
  };

  /**
   * DELETE /api/orders/cart/delete
   * Xóa cart item
   */
  deleteCartItem = async (req: Request, res: Response): Promise<void> => {
    try {
      const customerId = (req as any).user?.id;
      if (!customerId) {
        res.status(401).json({ error: "Chưa đăng nhập" });
        return;
      }

      const deleteDto: DeleteCartItemDto = req.body;
      const result = await this.cartService.deleteCartItem(
        customerId,
        deleteDto
      );
      res.json(result);
    } catch (error: any) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          error: error.message,
          code: error.code,
        });
      } else {
        console.error("Error deleting cart item:", error);
        res.status(404).json({
          error: "Lỗi khi tiến hành xóa sản phẩm",
        });
      }
    }
  };
}
