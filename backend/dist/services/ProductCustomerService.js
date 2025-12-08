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
exports.ProductCustomerService = void 0;
const tsyringe_1 = require("tsyringe");
const ProductCustomerRepository_1 = require("../repositories/ProductCustomerRepository");
const errorHandler_1 = require("../middleware/errorHandler");
const supabase_1 = require("../config/supabase");
let ProductCustomerService = class ProductCustomerService {
    constructor(productCustomerRepo) {
        this.productCustomerRepo = productCustomerRepo;
    }
    /**
     * Lấy tất cả products với quantity và thumbnail
     */
    async getAllProducts() {
        const products = await this.productCustomerRepo.findAll();
        if (products.length === 0)
            return [];
        const productIds = products.map((p) => p.product_id);
        const { quantityMap, thumbnailMap } = await this.productCustomerRepo.getProductItemsWithQuantityAndImages(productIds);
        return products.map((p) => ({
            ...p,
            total_quantity: quantityMap.get(p.product_id) ?? 0,
            thumbnail: thumbnailMap.get(p.product_id) ?? null,
        }));
    }
    /**
     * Lấy products theo category
     */
    async getProductsByCategory(categoryId) {
        const products = await this.productCustomerRepo.findByCategory(categoryId);
        if (products.length === 0)
            return [];
        const productIds = products.map((p) => p.product_id);
        const { quantityMap, thumbnailMap } = await this.productCustomerRepo.getProductItemsWithQuantityAndImages(productIds);
        return products.map((p) => ({
            ...p,
            total_quantity: quantityMap.get(p.product_id) ?? 0,
            thumbnail: thumbnailMap.get(p.product_id) ?? null,
        }));
    }
    /**
     * Search products
     */
    async searchProducts(keyword) {
        if (!keyword || keyword.trim() === "") {
            return [];
        }
        const products = await this.productCustomerRepo.search(keyword.trim());
        if (products.length === 0)
            return [];
        const productIds = products.map((p) => p.product_id);
        const { quantityMap, thumbnailMap } = await this.productCustomerRepo.getProductItemsWithQuantityAndImages(productIds);
        return products.map((p) => ({
            ...p,
            total_quantity: quantityMap.get(p.product_id) ?? 0,
            thumbnail: thumbnailMap.get(p.product_id) ?? null,
        }));
    }
    /**
     * Filter products
     */
    async filterProducts(filterDto) {
        const products = await this.productCustomerRepo.filter(filterDto);
        if (products.length === 0)
            return [];
        const productIds = products.map((p) => p.product_id);
        // Nếu có optionIds, filter theo configurations
        if (filterDto.optionIds && filterDto.optionIds.length > 0) {
            const itemsWithConfig = await this.productCustomerRepo.getProductItemsWithConfigurations(productIds);
            const productIdMatches = new Set();
            itemsWithConfig.forEach((it) => {
                const itemOptionIds = new Set((it.product_configuration ?? []).map((c) => c.variation_option_id));
                const hasSome = filterDto.optionIds.some((id) => itemOptionIds.has(id));
                if (hasSome)
                    productIdMatches.add(it.product_id);
            });
            const filteredProducts = products.filter((p) => productIdMatches.has(p.product_id));
            if (filteredProducts.length === 0)
                return [];
            const filteredProductIds = filteredProducts.map((p) => p.product_id);
            const { quantityMap } = await this.productCustomerRepo.getProductItemsWithQuantityAndImages(filteredProductIds);
            return filteredProducts.map((p) => ({
                ...p,
                total_quantity: quantityMap.get(p.product_id) ?? 0,
            }));
        }
        else {
            // Không có optionIds, chỉ lấy quantity
            const { quantityMap } = await this.productCustomerRepo.getProductItemsWithQuantityAndImages(productIds);
            return products.map((p) => ({
                ...p,
                total_quantity: quantityMap.get(p.product_id) ?? 0,
            }));
        }
    }
    /**
     * Lấy featured products
     */
    async getFeaturedProducts(limit = 4) {
        const products = await this.productCustomerRepo.findFeatured(limit);
        if (products.length === 0)
            return [];
        const productIds = products.map((p) => p.product_id);
        const { quantityMap, thumbnailMap } = await this.productCustomerRepo.getProductItemsWithQuantityAndImages(productIds);
        return products.map((p) => ({
            ...p,
            total_quantity: quantityMap.get(p.product_id) ?? 0,
            thumbnail: thumbnailMap.get(p.product_id) ?? null,
        }));
    }
    /**
     * Lấy product detail
     */
    async getProductDetail(productId) {
        const product = await this.productCustomerRepo.findDetailById(productId);
        if (!product) {
            throw new errorHandler_1.AppError(404, "Product not found", "PRODUCT_NOT_FOUND");
        }
        const items = await this.productCustomerRepo.getProductItemsWithDetails(productId);
        const normalizedItems = items.map((it) => ({
            product_item_id: it.product_item_id,
            product_id: it.product_id,
            quantity: it.quantity,
            images: (it.product_image ?? []).map((img) => {
                const { data: { publicUrl }, } = supabase_1.supabase.storage
                    .from("product-images")
                    .getPublicUrl(img.image_filename);
                return {
                    image_id: img.image_id,
                    image_filename: img.image_filename,
                    image_url: publicUrl,
                };
            }),
            attributes: (it.product_configuration ?? []).map((cfg) => ({
                variation_option_id: cfg.variation_option_id,
                value: cfg.variation_options?.value,
                variation: cfg.variation_options?.variation
                    ? {
                        variation_id: cfg.variation_options.variation.variation_id,
                        name: cfg.variation_options.variation.name,
                    }
                    : null,
            })),
        }));
        return {
            ...product,
            items: normalizedItems,
        };
    }
    /**
     * Lấy variations theo category
     */
    async getVariationsByCategory(categoryId) {
        return await this.productCustomerRepo.getVariationsByCategory(categoryId);
    }
    /**
     * Đếm products
     */
    async countProducts(categoryId) {
        return await this.productCustomerRepo.count(categoryId);
    }
    /**
     * Lấy top products by category
     */
    async getTopByCategories(categoryIds = [1, 2, 5]) {
        const products = await this.productCustomerRepo.getTopByCategories(categoryIds);
        if (products.length === 0) {
            return categoryIds.map((id) => ({
                category_id: id,
                category_name: "",
                products: [],
            }));
        }
        const productIds = products.map((p) => p.product_id);
        const { items, thumbnailMap, inventoryMap } = await this.productCustomerRepo.getProductItemsForTop(productIds);
        const productItemIds = items.map((it) => it.product_item_id);
        const orderDetails = productItemIds.length > 0
            ? await this.productCustomerRepo.getOrderDetailsByProductItemIds(productItemIds)
            : [];
        // Map product_item_id to product_id
        const productItemIdToProductId = new Map();
        items.forEach((it) => {
            productItemIdToProductId.set(it.product_item_id, it.product_id);
        });
        // Tính sold quantity
        const productIdToSold = new Map();
        orderDetails.forEach((od) => {
            const pid = productItemIdToProductId.get(od.product_item_id);
            if (!pid)
                return;
            const prev = productIdToSold.get(pid) ?? 0;
            productIdToSold.set(pid, prev + od.quantity);
        });
        // Group by category
        return categoryIds.map((catId) => {
            const categoryProducts = products.filter((p) => p.category_id === catId);
            let categoryName = "";
            if (categoryProducts.length > 0 && categoryProducts[0]) {
                const firstProduct = categoryProducts[0];
                if (firstProduct?.category) {
                    const cat = Array.isArray(firstProduct.category)
                        ? firstProduct.category[0]
                        : firstProduct.category;
                    categoryName = cat?.category_name || "";
                }
            }
            const topProducts = [...categoryProducts]
                .map((p) => ({
                ...p,
                sold_quantity: productIdToSold.get(p.product_id) ?? 0,
                total_quantity: inventoryMap.get(p.product_id) ?? 0,
                thumbnail: thumbnailMap.get(p.product_id) ?? null,
            }))
                .sort((a, b) => b.sold_quantity - a.sold_quantity)
                .slice(0, 4);
            return {
                category_id: catId,
                category_name: categoryName,
                products: topProducts,
            };
        });
    }
    /**
     * Lấy specification của product
     */
    async getProductSpecification(productId) {
        return await this.productCustomerRepo.getProductSpecification(productId);
    }
};
exports.ProductCustomerService = ProductCustomerService;
exports.ProductCustomerService = ProductCustomerService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(ProductCustomerRepository_1.ProductCustomerRepository)),
    __metadata("design:paramtypes", [ProductCustomerRepository_1.ProductCustomerRepository])
], ProductCustomerService);
//# sourceMappingURL=ProductCustomerService.js.map