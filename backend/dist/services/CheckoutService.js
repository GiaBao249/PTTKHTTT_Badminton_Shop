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
exports.CheckoutService = void 0;
const tsyringe_1 = require("tsyringe");
const CheckoutRepository_1 = require("../repositories/CheckoutRepository");
const errorHandler_1 = require("../middleware/errorHandler");
let CheckoutService = class CheckoutService {
    constructor(checkoutRepo) {
        this.checkoutRepo = checkoutRepo;
    }
    /**
     * Xử lý checkout
     */
    async checkout(customerId, checkoutDto) {
        const { cart_items, address_id, shipping_info, payment_method, total_amount, } = checkoutDto;
        // Validation
        if (!cart_items || cart_items.length === 0) {
            throw new errorHandler_1.AppError(400, "Giỏ hàng trống", "VALIDATION_ERROR");
        }
        // Kiểm tra số lượng sản phẩm
        const productItemIds = cart_items.map((item) => item.product_item_id);
        const productItems = await this.checkoutRepo.getProductItemsByIds(productItemIds);
        for (const item of cart_items) {
            const productItem = productItems.find((p) => p.product_item_id === item.product_item_id);
            if (!productItem || productItem.quantity < item.quantity) {
                throw new errorHandler_1.AppError(400, `Sản phẩm #${item.product_item_id} không đủ số lượng`, "INSUFFICIENT_QUANTITY");
            }
        }
        // Xử lý địa chỉ
        let finalAddressId = address_id;
        if (!finalAddressId && !shipping_info) {
            throw new errorHandler_1.AppError(400, "Thiếu thông tin địa chỉ", "VALIDATION_ERROR");
        }
        if (!finalAddressId && shipping_info) {
            const { address, district, city } = shipping_info;
            if (!address || !district || !city) {
                throw new errorHandler_1.AppError(400, "Thiếu thông tin địa chỉ giao hàng", "VALIDATION_ERROR");
            }
            finalAddressId = await this.checkoutRepo.createAddress(customerId, shipping_info);
        }
        // Tạo order
        if (!finalAddressId) {
            throw new errorHandler_1.AppError(400, "Địa chỉ giao hàng là bắt buộc", "VALIDATION_ERROR");
        }
        const orderId = await this.checkoutRepo.createOrder(customerId, finalAddressId, total_amount);
        // Tạo order details
        await this.checkoutRepo.createOrderDetails(orderId, cart_items);
        // Xử lý theo payment method
        if (payment_method === "cod" || payment_method === "card") {
            // COD hoặc Card: Trừ inventory ngay và xóa cart
            await this.processInventoryAndCart(customerId, cart_items, productItems);
            return {
                success: true,
                order_id: orderId,
                message: "Đặt hàng thành công",
                payment_method: payment_method,
            };
        }
        else if (payment_method === "vnpay") {
            // VNPay: Chưa trừ inventory, trả về để redirect
            return {
                success: true,
                order_id: orderId,
                message: "Đang chuyển hướng đến trang thanh toán VNPay",
                payment_method: "vnpay",
                requires_payment: true,
            };
        }
        else if (payment_method === "vietqr") {
            // VietQR: Chưa trừ inventory, trả về để hiển thị QR
            return {
                success: true,
                order_id: orderId,
                message: "Vui lòng quét mã QR để thanh toán",
                payment_method: "vietqr",
                requires_payment: true,
            };
        }
        else {
            throw new errorHandler_1.AppError(400, "Phương thức thanh toán không hợp lệ", "VALIDATION_ERROR");
        }
    }
    /**
     * Trừ inventory và xóa cart items
     */
    async processInventoryAndCart(customerId, cartItems, productItems) {
        // Trừ inventory
        for (const item of cartItems) {
            const productItem = productItems.find((p) => p.product_item_id === item.product_item_id);
            if (productItem) {
                await this.checkoutRepo.updateProductItemQuantity(item.product_item_id, productItem.quantity - item.quantity);
            }
        }
        // Xóa cart items
        const cartId = await this.checkoutRepo.getCartByCustomerId(customerId);
        if (cartId) {
            const checkedOutProductIds = cartItems.map((item) => item.product_item_id);
            await this.checkoutRepo.deleteCartItems(cartId, checkedOutProductIds);
        }
    }
};
exports.CheckoutService = CheckoutService;
exports.CheckoutService = CheckoutService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(CheckoutRepository_1.CheckoutRepository)),
    __metadata("design:paramtypes", [CheckoutRepository_1.CheckoutRepository])
], CheckoutService);
//# sourceMappingURL=CheckoutService.js.map