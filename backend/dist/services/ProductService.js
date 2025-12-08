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
exports.ProductService = void 0;
const tsyringe_1 = require("tsyringe");
const ProductRepository_1 = require("../repositories/ProductRepository");
const errorHandler_1 = require("../middleware/errorHandler");
let ProductService = class ProductService {
    constructor(productRepo) {
        this.productRepo = productRepo;
    }
    async getAllProducts() {
        const products = await this.productRepo.findAll();
        if (products.length === 0) {
            return [];
        }
        const productIds = products.map((p) => p.product_id);
        const thumbnailMap = await this.productRepo.getProductItemsWithImages(productIds);
        return products.map((product) => ({
            ...product,
            thumbnail: thumbnailMap.get(product.product_id) ?? null,
        }));
    }
    async getProductById(productId) {
        const product = await this.productRepo.findById(productId);
        if (!product) {
            throw new errorHandler_1.AppError(404, "Không tìm thấy sản phẩm", "PRODUCT_NOT_FOUND");
        }
        const thumbnailMap = await this.productRepo.getProductItemsWithImages([
            product.product_id,
        ]);
        return {
            ...product,
            thumbnail: thumbnailMap.get(product.product_id) ?? null,
        };
    }
    async createProduct(createDto) {
        if (!createDto.product_name || !createDto.category_id) {
            throw new errorHandler_1.AppError(400, "Thiếu thông tin bắt buộc: tên sản phẩm và danh mục", "VALIDATION_ERROR");
        }
        if (createDto.price !== undefined &&
            createDto.price !== null &&
            createDto.price < 0) {
            throw new errorHandler_1.AppError(400, "Giá bán không được âm", "VALIDATION_ERROR");
        }
        if (createDto.price_purchase !== undefined &&
            createDto.price_purchase !== null &&
            createDto.price_purchase < 0) {
            throw new errorHandler_1.AppError(400, "Giá nhập không được âm", "VALIDATION_ERROR");
        }
        if (!createDto.items ||
            !Array.isArray(createDto.items) ||
            createDto.items.length === 0) {
            throw new errorHandler_1.AppError(400, "Cần ít nhất một biến thể sản phẩm (item)", "VALIDATION_ERROR");
        }
        const productData = {
            product_name: createDto.product_name,
            category_id: createDto.category_id,
            description: createDto.description || "",
            warranty_period: createDto.warranty_period || 0,
            price: createDto.price || 0,
        };
        if (createDto.supplier_id) {
            productData.supplier_id = createDto.supplier_id;
        }
        if (createDto.price_purchase !== undefined &&
            createDto.price_purchase !== null) {
            productData.price_purchase = createDto.price_purchase;
        }
        const newProduct = await this.productRepo.create(productData);
        const productId = newProduct.product_id;
        const createdItems = [];
        for (const item of createDto.items) {
            const variationOptionIds = item.variation_option_ids || [];
            const newProductItem = await this.productRepo.createProductItem(productId);
            if (variationOptionIds.length > 0) {
                await this.productRepo.createProductConfigurations(newProductItem.product_item_id, variationOptionIds);
            }
            createdItems.push({
                product_item_id: newProductItem.product_item_id,
                variation_option_ids: variationOptionIds,
            });
        }
        return {
            product: newProduct,
            product_items: createdItems,
        };
    }
    async updateProduct(productId, updateDto) {
        if (!updateDto.product_name || !updateDto.category_id || !updateDto.price) {
            throw new errorHandler_1.AppError(400, "Thiếu thông tin sản phẩm (tên, danh mục, giá)", "VALIDATION_ERROR");
        }
        if (updateDto.price <= 0) {
            throw new errorHandler_1.AppError(400, "Giá phải lớn hơn 0", "VALIDATION_ERROR");
        }
        const existingProduct = await this.productRepo.findById(productId);
        if (!existingProduct) {
            throw new errorHandler_1.AppError(404, "Không tìm thấy sản phẩm", "PRODUCT_NOT_FOUND");
        }
        return await this.productRepo.update(productId, updateDto);
    }
    async deleteProduct(productId) {
        const existingProduct = await this.productRepo.findById(productId);
        if (!existingProduct) {
            throw new errorHandler_1.AppError(404, "Không tìm thấy sản phẩm", "PRODUCT_NOT_FOUND");
        }
        if (existingProduct.is_deleted === true) {
            throw new errorHandler_1.AppError(400, "Sản phẩm đã bị xóa", "PRODUCT_ALREADY_DELETED");
        }
        await this.productRepo.softDelete(productId);
    }
    async getAllProductItems() {
        return await this.productRepo.findAllProductItems();
    }
};
exports.ProductService = ProductService;
exports.ProductService = ProductService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(ProductRepository_1.ProductRepository)),
    __metadata("design:paramtypes", [ProductRepository_1.ProductRepository])
], ProductService);
//# sourceMappingURL=ProductService.js.map