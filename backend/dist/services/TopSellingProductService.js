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
exports.TopSellingProductService = void 0;
const tsyringe_1 = require("tsyringe");
const TopSellingProductRepository_1 = require("../repositories/TopSellingProductRepository");
const supabase_1 = require("../config/supabase");
let TopSellingProductService = class TopSellingProductService {
    constructor(productRepo) {
        this.productRepo = productRepo;
    }
    async getTopSellingProducts(limit = 5) {
        const orderDetails = await this.productRepo.getOrderDetails();
        if (orderDetails.length === 0) {
            return [];
        }
        const productItemIds = [
            ...new Set(orderDetails.map((od) => od.product_item_id)),
        ].filter(Boolean);
        const productItems = await this.productRepo.getProductItemsByIds(productItemIds);
        const productItemIdToProductId = new Map();
        productItems.forEach((pi) => {
            productItemIdToProductId.set(pi.product_item_id, pi.product_id);
        });
        const productIdToSoldQuantity = new Map();
        orderDetails.forEach((od) => {
            const productId = productItemIdToProductId.get(od.product_item_id);
            if (productId) {
                const current = productIdToSoldQuantity.get(productId) || 0;
                productIdToSoldQuantity.set(productId, current + (od.quantity || 0));
            }
        });
        const sortProductIds = Array.from(productIdToSoldQuantity.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([productId]) => productId);
        if (sortProductIds.length === 0) {
            return [];
        }
        const products = await this.productRepo.getProductsWithImages(sortProductIds);
        const thumbnailMap = new Map();
        products.forEach((p) => {
            const firstItem = p.product_item?.[0];
            const firstImage = firstItem?.product_image?.[0]?.image_filename;
            if (p.product_id && firstImage && !thumbnailMap.has(p.product_id)) {
                const { data: { publicUrl }, } = supabase_1.supabase.storage.from("product-images").getPublicUrl(firstImage);
                thumbnailMap.set(p.product_id, publicUrl);
            }
        });
        return sortProductIds
            .map((productId) => {
            const product = products.find((p) => p.product_id === productId);
            const soldQuantity = productIdToSoldQuantity.get(productId) || 0;
            if (!product)
                return null;
            return {
                product_id: productId,
                product_name: product.product_name,
                price: product.price || 0,
                sold_quantity: soldQuantity,
                thumbnail: thumbnailMap.get(productId) ?? null,
            };
        })
            .filter((p) => p !== null);
    }
};
exports.TopSellingProductService = TopSellingProductService;
exports.TopSellingProductService = TopSellingProductService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(TopSellingProductRepository_1.TopSellingProductRepository)),
    __metadata("design:paramtypes", [TopSellingProductRepository_1.TopSellingProductRepository])
], TopSellingProductService);
//# sourceMappingURL=TopSellingProductService.js.map