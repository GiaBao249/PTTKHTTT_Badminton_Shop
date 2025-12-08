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
exports.ProductController = void 0;
const tsyringe_1 = require("tsyringe");
const ProductService_1 = require("../services/ProductService");
const errorHandler_1 = require("../middleware/errorHandler");
let ProductController = class ProductController {
    constructor(productService) {
        this.productService = productService;
        /**
         * GET /api/admin/getProducts
         */
        this.getAllProducts = async (req, res) => {
            try {
                const products = await this.productService.getAllProducts();
                res.json(products);
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    res
                        .status(error.statusCode)
                        .json({ error: error.message, code: error.code });
                }
                else {
                    console.error("Error getting products:", error);
                    res.status(500).json({ error: "Lỗi server khi lấy sản phẩm" });
                }
            }
        };
        /**
         * GET /api/admin/products/:id
         * Lấy product theo ID
         */
        this.getProductById = async (req, res) => {
            try {
                const productId = parseInt(req.params.id || "0");
                if (isNaN(productId)) {
                    res.status(400).json({ error: "Invalid product ID" });
                    return;
                }
                const product = await this.productService.getProductById(productId);
                res.json(product);
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    res
                        .status(error.statusCode)
                        .json({ error: error.message, code: error.code });
                }
                else {
                    console.error("Error getting product:", error);
                    res.status(500).json({ error: "Lỗi server khi lấy sản phẩm" });
                }
            }
        };
        /**
         * POST /api/admin/createProducts
         */
        this.createProduct = async (req, res) => {
            try {
                const createDto = req.body;
                const result = await this.productService.createProduct(createDto);
                res.status(201).json({
                    success: true,
                    product: result.product,
                    product_items: result.product_items,
                    message: "Tạo sản phẩm thành công",
                });
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    res
                        .status(error.statusCode)
                        .json({ error: error.message, code: error.code });
                }
                else {
                    console.error("Error creating product:", error);
                    res.status(500).json({ error: "Lỗi server khi tạo sản phẩm" });
                }
            }
        };
        /**
         * PUT /api/admin/updateProduct/:id
         */
        this.updateProduct = async (req, res) => {
            try {
                const productId = parseInt(req.params.id || "0");
                if (isNaN(productId)) {
                    res.status(400).json({ error: "Invalid product ID" });
                    return;
                }
                const updateDto = req.body;
                const updatedProduct = await this.productService.updateProduct(productId, updateDto);
                res.json({
                    success: true,
                    product: updatedProduct,
                    message: "Cập nhật sản phẩm thành công",
                });
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    res
                        .status(error.statusCode)
                        .json({ error: error.message, code: error.code });
                }
                else {
                    console.error("Error updating product:", error);
                    res.status(500).json({ error: "Lỗi server khi cập nhật sản phẩm" });
                }
            }
        };
        /**
         * DELETE /api/admin/deleteProduct/:id
         */
        this.deleteProduct = async (req, res) => {
            try {
                const productId = parseInt(req.params.id || "0");
                if (isNaN(productId)) {
                    res.status(400).json({ error: "Invalid product ID" });
                    return;
                }
                await this.productService.deleteProduct(productId);
                res.json({
                    success: true,
                    message: "Xóa sản phẩm thành công",
                });
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    res
                        .status(error.statusCode)
                        .json({ error: error.message, code: error.code });
                }
                else {
                    console.error("Error deleting product:", error);
                    res.status(500).json({ error: "Không thể xóa sản phẩm" });
                }
            }
        };
        /**
         * GET /api/admin/getProductsItem
         */
        this.getAllProductItems = async (req, res) => {
            try {
                const productItems = await this.productService.getAllProductItems();
                res.json(productItems);
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    res
                        .status(error.statusCode)
                        .json({ error: error.message, code: error.code });
                }
                else {
                    console.error("Error getting product items:", error);
                    res.status(500).json({ error: "Lỗi server khi lấy sản phẩm" });
                }
            }
        };
    }
};
exports.ProductController = ProductController;
exports.ProductController = ProductController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(ProductService_1.ProductService)),
    __metadata("design:paramtypes", [ProductService_1.ProductService])
], ProductController);
//# sourceMappingURL=ProductController.js.map