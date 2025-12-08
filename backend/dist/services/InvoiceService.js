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
exports.InvoiceService = void 0;
const tsyringe_1 = require("tsyringe");
const InvoiceRepository_1 = require("../repositories/InvoiceRepository");
const errorHandler_1 = require("../middleware/errorHandler");
let InvoiceService = class InvoiceService {
    constructor(invoiceRepo) {
        this.invoiceRepo = invoiceRepo;
    }
    async getInvoices(filters) {
        const orders = await this.invoiceRepo.findOrdersWithFilter(filters);
        if (orders.length === 0) {
            return [];
        }
        const customerIds = [
            ...new Set(orders.map((o) => o.customer_id).filter(Boolean)),
        ];
        const orderIds = orders.map((o) => o.order_id).filter(Boolean);
        const [customerMap, orderDetails] = await Promise.all([
            this.invoiceRepo.getCustomerByIds(customerIds),
            this.invoiceRepo.getOrderDetailsByOrderIds(orderIds),
        ]);
        const productItemIds = [
            ...new Set(orderDetails.map((od) => od?.product_item_id).filter(Boolean)),
        ];
        if (productItemIds.length === 0) {
            return orders.map((order) => ({
                ...order,
                customer: customerMap.get(order.customer_id) || null,
                orderdetail: [],
            }));
        }
        const productItemMap = await this.invoiceRepo.getProductItemsByIds(productItemIds);
        const productIds = [
            ...new Set(Array.from(productItemMap.values())
                .map((pi) => pi.product_id)
                .filter(Boolean)),
        ];
        const productMap = await this.invoiceRepo.getProductsWithCategoriesAndImages(productIds);
        const orderDetailsWithProducts = orderDetails.map((detail) => {
            const productItem = productItemMap.get(detail.product_item_id);
            const product = productItem
                ? productMap.get(productItem.product_id)
                : null;
            return {
                ...detail,
                product_item: productItem
                    ? {
                        ...productItem,
                        product: product || null,
                    }
                    : null,
            };
        });
        const orderDetailsByOrderId = new Map();
        orderDetailsWithProducts.forEach((detail) => {
            const orderId = detail.order_id;
            if (!orderDetailsByOrderId.has(orderId)) {
                orderDetailsByOrderId.set(orderId, []);
            }
            orderDetailsByOrderId.get(orderId).push(detail);
        });
        return orders.map((order) => ({
            ...order,
            customer: customerMap.get(order.customer_id) || null,
            orderdetail: orderDetailsByOrderId.get(order.order_id) || [],
        }));
    }
    async getInvoiceByOrderId(orderId, userId, userRole) {
        const order = await this.invoiceRepo.findOrderById(orderId);
        if (!order) {
            throw new errorHandler_1.AppError(404, "Không tìm thấy hóa đơn", "INVOICE_NOT_FOUND");
        }
        if (userRole === "user" && order.customer_id !== userId) {
            throw new errorHandler_1.AppError(403, "Bạn không có quyền xem hóa đơn này", "FORBIDDEN");
        }
        const customerMap = await this.invoiceRepo.getCustomerByIds([
            order.customer_id,
        ]);
        const customer = customerMap.get(order.customer_id) || null;
        const orderDetails = await this.invoiceRepo.getOrderDetailsByOrderIds([
            orderId,
        ]);
        if (orderDetails.length === 0) {
            return {
                ...order,
                customer,
                orderdetail: [],
            };
        }
        const productItemIds = [
            ...new Set(orderDetails.map((od) => od?.product_item_id).filter(Boolean)),
        ];
        const [productItemMap, productMap] = await Promise.all([
            this.invoiceRepo.getProductItemsByIds(productItemIds),
            (async () => {
                const productItems = await this.invoiceRepo.getProductItemsByIds(productItemIds);
                const productIds = [
                    ...new Set(Array.from(productItems.values())
                        .map((pi) => pi.product_id)
                        .filter(Boolean)),
                ];
                return await this.invoiceRepo.getProductsWithCategoriesAndImages(productIds);
            })(),
        ]);
        const orderDetailsWithProducts = orderDetails.map((detail) => {
            const productItem = productItemMap.get(detail.product_item_id);
            const product = productItem
                ? productMap.get(productItem.product_id)
                : null;
            return {
                ...detail,
                product_item: productItem
                    ? {
                        ...productItem,
                        product: product || null,
                    }
                    : null,
            };
        });
        return {
            ...order,
            customer,
            orderdetail: orderDetailsWithProducts,
        };
    }
};
exports.InvoiceService = InvoiceService;
exports.InvoiceService = InvoiceService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(InvoiceRepository_1.InvoiceRepository)),
    __metadata("design:paramtypes", [InvoiceRepository_1.InvoiceRepository])
], InvoiceService);
//# sourceMappingURL=InvoiceService.js.map