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
exports.CartService = void 0;
const tsyringe_1 = require("tsyringe");
const CartRepository_1 = require("../repositories/CartRepository");
const errorHandler_1 = require("../middleware/errorHandler");
let CartService = class CartService {
    constructor(cartRepo) {
        this.cartRepo = cartRepo;
    }
    /**
     * Lấy cart items của customer
     */
    async getCartItems(customerId) {
        let cartId = await this.cartRepo.getCartIdByCustomerId(customerId);
        if (!cartId) {
            return [];
        }
        const cartItems = await this.cartRepo.getCartItems(cartId);
        // Lấy thumbnails
        const productIds = cartItems
            .map((item) => item.product_item?.product?.product_id)
            .filter(Boolean);
        if (productIds.length > 0) {
            const thumbnailMap = await this.cartRepo.getProductItemsWithImages(productIds);
            // Thêm thumbnail vào mỗi item
            return cartItems.map((item) => {
                const productId = item.product_item?.product?.product_id;
                if (productId && item.product_item?.product) {
                    item.product_item.product.thumbnail =
                        thumbnailMap.get(productId) ?? null;
                }
                return item;
            });
        }
        return cartItems;
    }
    /**
     * Thêm item vào cart
     */
    async addToCart(customerId, addDto) {
        const { product_item_id, quantity } = addDto;
        // Validation
        if (!product_item_id || !quantity) {
            throw new errorHandler_1.AppError(400, "Thiếu thông tin", "VALIDATION_ERROR");
        }
        if (typeof quantity !== "number" || quantity <= 0 || !Number.isInteger(quantity)) {
            throw new errorHandler_1.AppError(400, "Số lượng phải là số nguyên dương", "VALIDATION_ERROR");
        }
        // Lấy hoặc tạo cart
        let cartId = await this.cartRepo.getCartIdByCustomerId(customerId);
        if (!cartId) {
            cartId = await this.cartRepo.createCart(customerId);
        }
        // Kiểm tra product item
        const productItem = await this.cartRepo.getProductItemById(product_item_id);
        if (!productItem) {
            throw new errorHandler_1.AppError(404, "Không tìm thấy sản phẩm", "PRODUCT_NOT_FOUND");
        }
        if (!productItem.quantity || productItem.quantity <= 0) {
            throw new errorHandler_1.AppError(400, "Sản phẩm đã hết hàng", "OUT_OF_STOCK");
        }
        // Lấy giá sản phẩm
        const price = await this.cartRepo.getProductPrice(productItem.product_id);
        if (!price) {
            throw new errorHandler_1.AppError(404, "Không tìm thấy thông tin sản phẩm", "PRODUCT_NOT_FOUND");
        }
        // Kiểm tra item đã có trong cart chưa
        const existingItem = await this.cartRepo.getExistingCartItem(cartId, product_item_id);
        const totalQuantity = existingItem
            ? existingItem.quantity + quantity
            : quantity;
        if (totalQuantity > productItem.quantity) {
            throw new errorHandler_1.AppError(400, `Chỉ còn ${productItem.quantity} sản phẩm trong kho`, "INSUFFICIENT_QUANTITY");
        }
        if (existingItem) {
            // Cập nhật quantity
            const newQuantity = existingItem.quantity + quantity;
            const data = await this.cartRepo.updateCartItem(cartId, product_item_id, newQuantity, price * newQuantity);
            return {
                success: true,
                data,
                message: "Đã cập nhật giỏ hàng",
            };
        }
        else {
            // Thêm mới
            const data = await this.cartRepo.addCartItem(cartId, product_item_id, quantity, price * quantity);
            return {
                success: true,
                data,
                message: "Đã thêm vào giỏ hàng",
            };
        }
    }
    /**
     * Cập nhật cart item
     */
    async updateCartItem(customerId, updateDto) {
        const { product_item_id, quantity } = updateDto;
        if (!product_item_id || quantity === undefined) {
            throw new errorHandler_1.AppError(400, "Thiếu thông tin", "VALIDATION_ERROR");
        }
        if (typeof quantity !== "number" || quantity < 0 || !Number.isInteger(quantity)) {
            throw new errorHandler_1.AppError(400, "Số lượng phải là số nguyên không âm", "VALIDATION_ERROR");
        }
        const cartId = await this.cartRepo.getCartIdByCustomerId(customerId);
        if (!cartId) {
            throw new errorHandler_1.AppError(404, "Không tìm thấy giỏ hàng", "CART_NOT_FOUND");
        }
        // Kiểm tra product item
        const productItem = await this.cartRepo.getProductItemById(product_item_id);
        if (!productItem) {
            throw new errorHandler_1.AppError(404, "Không tìm thấy sản phẩm", "PRODUCT_NOT_FOUND");
        }
        if (quantity > productItem.quantity) {
            throw new errorHandler_1.AppError(400, `Chỉ còn ${productItem.quantity} sản phẩm trong kho`, "INSUFFICIENT_QUANTITY");
        }
        // Lấy giá
        const price = await this.cartRepo.getProductPrice(productItem.product_id);
        if (!price) {
            throw new errorHandler_1.AppError(404, "Không tìm thấy thông tin sản phẩm", "PRODUCT_NOT_FOUND");
        }
        const totalAmount = price * quantity;
        const data = await this.cartRepo.updateCartItem(cartId, product_item_id, quantity, totalAmount);
        return {
            success: true,
            data,
        };
    }
    /**
     * Xóa cart item
     */
    async deleteCartItem(customerId, deleteDto) {
        const { product_item_id } = deleteDto;
        if (!product_item_id) {
            throw new errorHandler_1.AppError(400, "Thiếu product_item_id", "VALIDATION_ERROR");
        }
        const cartId = await this.cartRepo.getCartIdByCustomerId(customerId);
        if (!cartId) {
            throw new errorHandler_1.AppError(404, "Không tìm thấy giỏ hàng", "CART_NOT_FOUND");
        }
        await this.cartRepo.deleteCartItem(cartId, product_item_id);
        return {
            success: true,
        };
    }
};
exports.CartService = CartService;
exports.CartService = CartService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(CartRepository_1.CartRepository)),
    __metadata("design:paramtypes", [CartRepository_1.CartRepository])
], CartService);
//# sourceMappingURL=CartService.js.map