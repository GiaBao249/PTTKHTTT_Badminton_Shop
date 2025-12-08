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
exports.MyOrderService = void 0;
const tsyringe_1 = require("tsyringe");
const MyOrderRepository_1 = require("../repositories/MyOrderRepository");
let MyOrderService = class MyOrderService {
    constructor(myOrderRepo) {
        this.myOrderRepo = myOrderRepo;
    }
    /**
     * Lấy orders của customer với details
     */
    async getMyOrders(customerId) {
        const orders = await this.myOrderRepo.getOrdersByCustomerId(customerId);
        if (orders.length === 0) {
            return [];
        }
        const orderIds = orders.map((o) => o.order_id);
        // Lấy order details
        const orderDetails = await this.myOrderRepo.getOrderDetailsByOrderIds(orderIds);
        // Lấy product items
        const productItemIds = orderDetails.map((od) => od.product_item_id);
        const productItemsMap = productItemIds.length > 0
            ? await this.myOrderRepo.getProductItemsWithProducts(productItemIds)
            : [];
        // Combine data
        return orders.map((order) => {
            const details = orderDetails.filter((od) => od.order_id === order.order_id);
            const detailsWithProducts = details.map((detail) => {
                const productInfo = productItemsMap.find((p) => p.product_item_id === detail.product_item_id);
                return {
                    ...detail,
                    product: productInfo || null,
                };
            });
            return {
                ...order,
                order_detail: details,
                infoProduct: detailsWithProducts,
            };
        });
    }
};
exports.MyOrderService = MyOrderService;
exports.MyOrderService = MyOrderService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(MyOrderRepository_1.MyOrderRepository)),
    __metadata("design:paramtypes", [MyOrderRepository_1.MyOrderRepository])
], MyOrderService);
//# sourceMappingURL=MyOrderService.js.map