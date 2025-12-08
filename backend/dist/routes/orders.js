"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const tsyringe_1 = require("tsyringe");
const authRequired_1 = require("../middleware/authRequired");
const CartController_1 = require("../controllers/CartController");
const MyOrderController_1 = require("../controllers/MyOrderController");
const CancelOrderController_1 = require("../controllers/CancelOrderController");
const router = express_1.default.Router();
// Resolve dependencies
const cartController = tsyringe_1.container.resolve(CartController_1.CartController);
const myOrderController = tsyringe_1.container.resolve(MyOrderController_1.MyOrderController);
const cancelOrderController = tsyringe_1.container.resolve(CancelOrderController_1.CancelOrderController);
// ========== CART ROUTES ==========
// GET /api/orders/cart/customer/:customerId - Lấy cart items
router.get("/cart/customer/:customerId", cartController.getCartItems);
// POST /api/orders/cart/add - Thêm item vào cart (protected)
router.post("/cart/add", authRequired_1.authRequired, cartController.addToCart);
// PUT /api/orders/cart/update - Cập nhật cart item (protected)
router.put("/cart/update", authRequired_1.authRequired, cartController.updateCartItem);
// DELETE /api/orders/cart/delete - Xóa cart item (protected)
router.delete("/cart/delete", authRequired_1.authRequired, cartController.deleteCartItem);
// ========== MY ORDERS ROUTES ==========
// GET /api/orders/customer/:id - Lấy orders của customer (protected)
router.get("/customer/:id", authRequired_1.authRequired, myOrderController.getMyOrders);
// ========== CANCEL ORDER ROUTES ==========
// PATCH /api/orders/cancel/:orderId - Hủy đơn hàng (protected)
router.patch("/cancel/:orderId", authRequired_1.authRequired, cancelOrderController.cancelOrder);
exports.default = router;
//# sourceMappingURL=orders.js.map