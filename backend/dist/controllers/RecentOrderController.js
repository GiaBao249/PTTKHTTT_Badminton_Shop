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
exports.OrderController = void 0;
// controllers/OrderController.ts (tạo mới hoặc mở rộng RecentOrderController)
const tsyringe_1 = require("tsyringe");
const OrderService_1 = require("../services/OrderService");
const errorHandler_1 = require("../middleware/errorHandler");
let OrderController = class OrderController {
    constructor(orderService) {
        this.orderService = orderService;
        this.getRecentOrders = async (req, res) => {
            try {
                const limit = parseInt(req.query.limit) || 5;
                const orders = await this.orderService.getRecentOrders(limit);
                res.json(orders);
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    res
                        .status(error.statusCode)
                        .json({ error: error.message, code: error.code });
                }
                else {
                    console.error("Error getting recent orders:", error);
                    res.status(500).json({ error: "Lỗi server khi lấy đơn hàng gần đây" });
                }
            }
        };
        /**
         * GET /api/admin/getOrders
         */
        this.getAllOrders = async (req, res) => {
            try {
                const orders = await this.orderService.getAllOrders();
                res.json(orders);
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    res
                        .status(error.statusCode)
                        .json({ error: error.message, code: error.code });
                }
                else {
                    console.error("Error getting orders:", error);
                    res
                        .status(500)
                        .json({ error: error.message || "Lỗi server khi lấy đơn hàng" });
                }
            }
        };
        /**
         * GET /api/admin/getOrdersDetail?order_id=
         */
        this.getOrderDetails = async (req, res) => {
            try {
                const orderId = req.query.order_id;
                if (!orderId || typeof orderId !== "string") {
                    res.status(400).json({ error: "Thiếu orderId hoặc sai định dạng" });
                    return;
                }
                const orderDetails = await this.orderService.getOrderDetailsByOrderId(Number(orderId));
                res.json(orderDetails);
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    res
                        .status(error.statusCode)
                        .json({ error: error.message, code: error.code });
                }
                else {
                    console.error("Error getting order details:", error);
                    res.status(500).json({ error: "Lỗi server khi lấy chi tiết đơn hàng" });
                }
            }
        };
        /**
         * PATCH /api/admin/updateOrderStatus
         */
        this.updateOrderStatus = async (req, res) => {
            try {
                const { order_id, status } = req.body;
                const result = await this.orderService.updateOrderStatus({
                    order_id,
                    status,
                });
                res.json({
                    success: true,
                    message: result.message,
                    order: result.order,
                });
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    res
                        .status(error.statusCode)
                        .json({ error: error.message, code: error.code });
                }
                else {
                    console.error("Error updating order status:", error);
                    res.status(500).json({ error: "Lỗi máy chủ" });
                }
            }
        };
    }
};
exports.OrderController = OrderController;
exports.OrderController = OrderController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(OrderService_1.OrderService)),
    __metadata("design:paramtypes", [OrderService_1.OrderService])
], OrderController);
//# sourceMappingURL=RecentOrderController.js.map