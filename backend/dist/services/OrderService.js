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
exports.OrderService = void 0;
const tsyringe_1 = require("tsyringe");
const OrderRepository_1 = require("../repositories/OrderRepository");
const errorHandler_1 = require("../middleware/errorHandler");
let OrderService = class OrderService {
    constructor(orderRepo) {
        this.orderRepo = orderRepo;
    }
    async getRecentOrders(limit = 5) {
        return await this.orderRepo.findRecent(limit);
    }
    async getAllOrders() {
        return await this.orderRepo.findAll();
    }
    /**
     * Lấy order theo ID
     */
    async getOrderById(orderId) {
        const order = await this.orderRepo.findById(orderId);
        if (!order) {
            throw new errorHandler_1.AppError(404, "Không tìm thấy đơn hàng", "ORDER_NOT_FOUND");
        }
        return order;
    }
    /**
     * Lấy order details theo order ID
     */
    async getOrderDetailsByOrderId(orderId) {
        // Validate orderId
        if (!orderId || isNaN(Number(orderId))) {
            throw new errorHandler_1.AppError(400, "Thiếu orderId hoặc sai định dạng", "VALIDATION_ERROR");
        }
        return await this.orderRepo.getOrderDetailsByOrderId(Number(orderId));
    }
    /**
     * Cập nhật order status với logic trả lại số lượng khi hủy
     */
    async updateOrderStatus(updateDto) {
        // Validation
        if (!updateDto.order_id) {
            throw new errorHandler_1.AppError(400, "Thiếu order_id", "VALIDATION_ERROR");
        }
        if (!updateDto.status) {
            throw new errorHandler_1.AppError(400, "Thiếu status", "VALIDATION_ERROR");
        }
        // Lấy order status hiện tại
        const oldStatus = await this.orderRepo.getOrderStatus(updateDto.order_id);
        if (!oldStatus) {
            throw new errorHandler_1.AppError(404, "Không tìm thấy đơn hàng", "ORDER_NOT_FOUND");
        }
        const isCancelling = updateDto.status === "Cancelled" && oldStatus !== "Cancelled";
        // Nếu đang hủy đơn, trả lại số lượng sản phẩm vào kho
        if (isCancelling) {
            await this.restoreProductQuantities(updateDto.order_id);
        }
        // Cập nhật status
        const updatedOrder = await this.orderRepo.updateStatus(updateDto.order_id, updateDto.status);
        return {
            order: updatedOrder,
            message: isCancelling
                ? "Hủy đơn hàng thành công và đã trả lại số lượng sản phẩm vào kho"
                : "Cập nhật trạng thái thành công",
        };
    }
    /**
     * Trả lại số lượng sản phẩm vào kho khi hủy đơn
     */
    async restoreProductQuantities(orderId) {
        const orderDetails = await this.orderRepo.getOrderDetailsByOrderId(orderId);
        if (orderDetails.length === 0) {
            return;
        }
        // Xử lý từng product item
        for (const detail of orderDetails) {
            try {
                const currentQuantity = await this.orderRepo.getProductItemQuantity(detail.product_item_id);
                if (currentQuantity === null) {
                    console.warn(`Product item ${detail.product_item_id} không tồn tại`);
                    continue;
                }
                const newQuantity = currentQuantity + detail.quantity;
                await this.orderRepo.updateProductItemQuantity(detail.product_item_id, newQuantity);
                console.log(`Trả lại ${detail.quantity} sản phẩm cho product_item ${detail.product_item_id}`);
            }
            catch (error) {
                console.error(`Error restoring quantity for product_item ${detail.product_item_id}:`, error);
            }
        }
    }
};
exports.OrderService = OrderService;
exports.OrderService = OrderService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(OrderRepository_1.OrderRepository)),
    __metadata("design:paramtypes", [OrderRepository_1.OrderRepository])
], OrderService);
//# sourceMappingURL=OrderService.js.map