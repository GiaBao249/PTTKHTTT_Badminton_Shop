import express from "express";
import { container } from "tsyringe";
import { authRequired } from "../middleware/authRequired";
import { CartController } from "../controllers/CartController";
import { MyOrderController } from "../controllers/MyOrderController";
import { CancelOrderController } from "../controllers/CancelOrderController";

const router = express.Router();

// Resolve dependencies
const cartController = container.resolve(CartController);
const myOrderController = container.resolve(MyOrderController);
const cancelOrderController = container.resolve(CancelOrderController);

// ========== CART ROUTES ==========
// GET /api/orders/cart/customer/:customerId - Lấy cart items
router.get("/cart/customer/:customerId", cartController.getCartItems);

// POST /api/orders/cart/add - Thêm item vào cart (protected)
router.post("/cart/add", authRequired, cartController.addToCart);

// PUT /api/orders/cart/update - Cập nhật cart item (protected)
router.put("/cart/update", authRequired, cartController.updateCartItem);

// DELETE /api/orders/cart/delete - Xóa cart item (protected)
router.delete("/cart/delete", authRequired, cartController.deleteCartItem);

// ========== MY ORDERS ROUTES ==========
// GET /api/orders/customer/:id - Lấy orders của customer (protected)
router.get("/customer/:id", authRequired, myOrderController.getMyOrders);

// ========== CANCEL ORDER ROUTES ==========
// PATCH /api/orders/cancel/:orderId - Hủy đơn hàng (protected)
router.patch("/cancel/:orderId", authRequired, cancelOrderController.cancelOrder);

export default router;
