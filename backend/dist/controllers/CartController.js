"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartController = void 0;
const tsyringe_1 = require("tsyringe");
const CartService_1 = require("../services/CartService");
const errorHandler_1 = require("../middleware/errorHandler");
let CartController = class CartController {
    constructor(cartService) {
        this.cartService = cartService;
        /**
         * GET /api/orders/cart/customer/:customerId
         * Lấy cart items của customer
         */
        this.getCartItems = async (req, res) => {
            try {
                const customerId = parseInt(req.params.customerId || "0");
                if (isNaN(customerId)) {
                    res.status(400).json({ error: "Invalid customer ID" });
                    return;
                }
                const cartItems = await this.cartService.getCartItems(customerId);
                res.json(cartItems);
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    res.status(error.statusCode).json({
                        error: error.message,
                        code: error.code,
                    });
                }
                else {
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
        this.addToCart = async (req, res) => {
            try {
                const customerId = req.user?.id;
                if (!customerId) {
                    res.status(401).json({ error: "Chưa đăng nhập" });
                    return;
                }
                const addDto = req.body;
                const result = await this.cartService.addToCart(customerId, addDto);
                res.json(result);
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    res.status(error.statusCode).json({
                        error: error.message,
                        code: error.code,
                    });
                }
                else {
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
        this.updateCartItem = async (req, res) => {
            try {
                const customerId = req.user?.id;
                if (!customerId) {
                    res.status(401).json({ error: "Chưa đăng nhập" });
                    return;
                }
                const updateDto = req.body;
                const result = await this.cartService.updateCartItem(customerId, updateDto);
                res.json(result);
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    res.status(error.statusCode).json({
                        error: error.message,
                        code: error.code,
                    });
                }
                else {
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
        this.deleteCartItem = async (req, res) => {
            try {
                const customerId = req.user?.id;
                if (!customerId) {
                    res.status(401).json({ error: "Chưa đăng nhập" });
                    return;
                }
                const deleteDto = req.body;
                const result = await this.cartService.deleteCartItem(customerId, deleteDto);
                res.json(result);
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    res.status(error.statusCode).json({
                        error: error.message,
                        code: error.code,
                    });
                }
                else {
                    console.error("Error deleting cart item:", error);
                    res.status(404).json({
                        error: "Lỗi khi tiến hành xóa sản phẩm",
                    });
                }
            }
        };
    }
};
exports.CartController = CartController;
exports.CartController = CartController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(CartService_1.CartService)),
    __metadata("design:paramtypes", [CartService_1.CartService])
], CartController);
//# sourceMappingURL=CartController.js.map