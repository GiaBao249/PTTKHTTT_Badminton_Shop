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
exports.CancelOrderService = void 0;
const tsyringe_1 = require("tsyringe");
const CancelOrderRepository_1 = require("../repositories/CancelOrderRepository");
const errorHandler_1 = require("../middleware/errorHandler");
let CancelOrderService = class CancelOrderService {
    constructor(cancelOrderRepo) {
        this.cancelOrderRepo = cancelOrderRepo;
    }
    /**
     * Hủy đơn hàng
     */
    async cancelOrder(orderId, customerId) {
        // Kiểm tra order
        const order = await this.cancelOrderRepo.getOrderById(orderId);
        if (!order) {
            throw new errorHandler_1.AppError(404, "Không tìm thấy đơn hàng", "ORDER_NOT_FOUND");
        }
        // Kiểm tra quyền
        if (order.customer_id !== customerId) {
            throw new errorHandler_1.AppError(403, "Bạn không có quyền hủy đơn hàng này", "FORBIDDEN");
        }
        // Kiểm tra status
        if (order.status !== "Pending" && order.status !== "Processing") {
            throw new errorHandler_1.AppError(400, `Không thể hủy đơn hàng với trạng thái hiện tại: ${order.status}. Chỉ có thể hủy đơn hàng đang "Chờ xử lý"`, "INVALID_STATUS");
        }
        // Lấy order details
        const orderDetails = await this.cancelOrderRepo.getOrderDetails(orderId);
        // Trả lại số lượng sản phẩm vào kho
        if (orderDetails.length > 0) {
            for (const detail of orderDetails) {
                try {
                    const currentQuantity = await this.cancelOrderRepo.getProductItemQuantity(detail.product_item_id);
                    if (currentQuantity === null) {
                        console.warn(`Product item ${detail.product_item_id} không tồn tại`);
                        continue;
                    }
                    const newQuantity = currentQuantity + detail.quantity;
                    await this.cancelOrderRepo.updateProductItemQuantity(detail.product_item_id, newQuantity);
                    console.log(`Trả lại ${detail.quantity} sản phẩm cho product_item ${detail.product_item_id}`);
                }
                catch (error) {
                    console.error(`Error restoring quantity for product_item ${detail.product_item_id}:`, error);
                }
            }
        }
        // Cập nhật order status
        const updatedOrder = await this.cancelOrderRepo.updateOrderStatus(orderId, "Cancelled");
        return {
            success: true,
            message: "Hủy đơn hàng thành công và đã trả lại số lượng sản phẩm vào kho",
            order: updatedOrder,
        };
    }
};
exports.CancelOrderService = CancelOrderService;
exports.CancelOrderService = CancelOrderService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(CancelOrderRepository_1.CancelOrderRepository)),
    __metadata("design:paramtypes", [CancelOrderRepository_1.CancelOrderRepository])
], CancelOrderService);
//# sourceMappingURL=CancelOrderService.js.map