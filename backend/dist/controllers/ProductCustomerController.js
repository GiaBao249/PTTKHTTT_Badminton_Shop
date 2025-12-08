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
exports.ProductCustomerController = void 0;
const tsyringe_1 = require("tsyringe");
const ProductCustomerService_1 = require("../services/ProductCustomerService");
const errorHandler_1 = require("../middleware/errorHandler");
let ProductCustomerController = class ProductCustomerController {
    constructor(productCustomerService) {
        this.productCustomerService = productCustomerService;
        /**
         * GET /api/products/
         * Lấy tất cả products
         */
        this.getAllProducts = async (req, res) => {
            try {
                const products = await this.productCustomerService.getAllProducts();
                res.json(products);
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    res.status(error.statusCode).json({
                        error: error.message,
                        code: error.code,
                    });
                }
                else {
                    console.error("Error getting products:", error);
                    res.status(500).json({ error: error.message || "Lỗi server" });
                }
            }
        };
        /**
         * GET /api/products/category/:categoryId
         * Lấy products theo category
         */
        this.getProductsByCategory = async (req, res) => {
            try {
                const categoryId = parseInt(req.params.categoryId || "0");
                if (isNaN(categoryId)) {
                    res.status(400).json({ error: "Invalid category ID" });
                    return;
                }
                const products = await this.productCustomerService.getProductsByCategory(categoryId);
                res.json(products);
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    res.status(error.statusCode).json({
                        error: error.message,
                        code: error.code,
                    });
                }
                else {
                    console.error("Error getting products by category:", error);
                    res.status(500).json({ error: error.message || "Lỗi server" });
                }
            }
        };
        /**
         * GET /api/products/search/:keyword
         * Search products
         */
        this.searchProducts = async (req, res) => {
            try {
                const keyword = req.params.keyword;
                const products = await this.productCustomerService.searchProducts(keyword || "");
                res.json(products);
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    res.status(error.statusCode).json({
                        error: error.message,
                        code: error.code,
                    });
                }
                else {
                    console.error("Error searching products:", error);
                    res.status(500).json({ error: error.message || "Lỗi server" });
                }
            }
        };
        /**
         * POST /api/products/filter
         * Filter products
         */
        this.filterProducts = async (req, res) => {
            try {
                const filterDto = req.body;
                const products = await this.productCustomerService.filterProducts(filterDto);
                res.json(products);
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    res.status(error.statusCode).json({
                        error: error.message,
                        code: error.code,
                    });
                }
                else {
                    console.error("Error filtering products:", error);
                    res.status(500).json({ error: error.message || "Lỗi server" });
                }
            }
        };
        /**
         * GET /api/products/featured-products
         * Lấy featured products
         */
        this.getFeaturedProducts = async (req, res) => {
            try {
                const products = await this.productCustomerService.getFeaturedProducts(4);
                res.json(products);
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    res.status(error.statusCode).json({
                        error: error.message,
                        code: error.code,
                    });
                }
                else {
                    console.error("Error getting featured products:", error);
                    res.status(500).json({ error: error.message || "Lỗi server" });
                }
            }
        };
        /**
         * GET /api/products/:id
         * Lấy product detail
         */
        this.getProductDetail = async (req, res) => {
            try {
                const productId = parseInt(req.params.id || "0");
                if (isNaN(productId)) {
                    res.status(400).json({ error: "Invalid product ID" });
                    return;
                }
                const product = await this.productCustomerService.getProductDetail(productId);
                res.json(product);
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    res.status(error.statusCode).json({
                        error: error.message,
                        code: error.code,
                    });
                }
                else {
                    console.error("Error getting product detail:", error);
                    res.status(500).json({ error: error.message || "Lỗi server" });
                }
            }
        };
        /**
         * GET /api/products/category/:categoryId/variations
         * Lấy variations theo category
         */
        this.getVariationsByCategory = async (req, res) => {
            try {
                const categoryId = parseInt(req.params.categoryId || "0");
                if (isNaN(categoryId)) {
                    res.status(400).json({ error: "Invalid category ID" });
                    return;
                }
                const variations = await this.productCustomerService.getVariationsByCategory(categoryId);
                res.json(variations);
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    res.status(error.statusCode).json({
                        error: error.message,
                        code: error.code,
                    });
                }
                else {
                    console.error("Error getting variations:", error);
                    res.status(500).json({ error: error.message || "Lỗi server" });
                }
            }
        };
        /**
         * GET /api/products/count?category=&categoryId=
         * Đếm products
         */
        this.countProducts = async (req, res) => {
            try {
                const { category, categoryId } = req.query;
                const slugToId = {
                    all: -1,
                    rackets: 1,
                    shoes: 2,
                    clothes: 3,
                    accessories: 4,
                    shuttlecocks: 5,
                };
                let resolvedCategoryId = undefined;
                if (categoryId) {
                    const parsed = Number(categoryId);
                    resolvedCategoryId = Number.isFinite(parsed) ? parsed : undefined;
                }
                else if (category) {
                    const key = String(category).toLowerCase();
                    const id = slugToId[key];
                    resolvedCategoryId = id && id > 0 ? id : undefined;
                }
                const count = await this.productCustomerService.countProducts(resolvedCategoryId);
                res.json({ count });
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    res.status(error.statusCode).json({
                        error: error.message,
                        code: error.code,
                    });
                }
                else {
                    console.error("Error counting products:", error);
                    res.status(500).json({ error: error.message || "Lỗi server" });
                }
            }
        };
        /**
         * GET /api/products/top-by-categories
         * Lấy top products by category
         */
        this.getTopByCategories = async (req, res) => {
            try {
                const topProducts = await this.productCustomerService.getTopByCategories();
                res.json(topProducts);
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    res.status(error.statusCode).json({
                        error: error.message,
                        code: error.code,
                    });
                }
                else {
                    console.error("Error getting top products:", error);
                    res.status(500).json({ error: error.message || "Lỗi server" });
                }
            }
        };
        /**
         * GET /api/products/:id/specification
         * Lấy specification của product
         */
        this.getProductSpecification = async (req, res) => {
            try {
                const productId = parseInt(req.params.id || "0");
                if (isNaN(productId)) {
                    res.status(400).json({ error: "Invalid product ID" });
                    return;
                }
                const specs = await this.productCustomerService.getProductSpecification(productId);
                res.json(specs);
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    res.status(error.statusCode).json({
                        error: error.message,
                        code: error.code,
                    });
                }
                else {
                    console.error("Error getting product specification:", error);
                    res.status(500).json({ error: error.message || "Lỗi server" });
                }
            }
        };
    }
};
exports.ProductCustomerController = ProductCustomerController;
exports.ProductCustomerController = ProductCustomerController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(ProductCustomerService_1.ProductCustomerService)),
    __metadata("design:paramtypes", [ProductCustomerService_1.ProductCustomerService])
], ProductCustomerController);
//# sourceMappingURL=ProductCustomerController.js.map