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
exports.CategoryController = void 0;
const tsyringe_1 = require("tsyringe");
const CategoryService_1 = require("../services/CategoryService");
const errorHandler_1 = require("../middleware/errorHandler");
let CategoryController = class CategoryController {
    constructor(categoryService) {
        this.categoryService = categoryService;
        this.getAllCategories = async (req, res) => {
            try {
                const categories = await this.categoryService.getAllCategories();
                res.json(categories);
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    res
                        .status(error.statusCode)
                        .json({ error: error.message, code: error.code });
                }
                else {
                    console.error("Error getting categories:", error);
                    res.status(500).json({ error: "Lỗi server khi lấy danh mục" });
                }
            }
        };
        this.getCategoryById = async (req, res) => {
            try {
                const categoryId = parseInt(req.params.id || "0");
                if (isNaN(categoryId)) {
                    res.status(400).json({ error: "Invalid category ID" });
                    return;
                }
                const category = await this.categoryService.getCategoryById(categoryId);
                res.json(category);
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    res
                        .status(error.statusCode)
                        .json({ error: error.message, code: error.code });
                }
                else {
                    console.error("Error getting category:", error);
                    res.status(500).json({ error: "Lỗi server khi lấy danh mục" });
                }
            }
        };
        this.createCategory = async (req, res) => {
            try {
                const dto = req.body;
                const category = await this.categoryService.createCategory(dto);
                res.status(200).json({
                    success: true,
                    category,
                    message: "Tạo danh mục thành công",
                });
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    res
                        .status(error.statusCode)
                        .json({ error: error.message, code: error.code });
                }
                else {
                    console.error("Error creating category:", error);
                    res.status(500).json({ error: "Lỗi server khi tạo danh mục" });
                }
            }
        };
        this.updateCategory = async (req, res) => {
            try {
                const dto = req.body;
                const categoryId = parseInt(req.params.id || "0");
                if (isNaN(categoryId)) {
                    res.status(400).json({ error: "Invalid category id" });
                    return;
                }
                const category = await this.categoryService.updateCategory(categoryId, dto);
                res.json({
                    success: true,
                    category,
                    message: "Cập nhật danh mục thành công",
                });
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    res
                        .status(error.statusCode)
                        .json({ error: error.message, code: error.code });
                }
                else {
                    console.error("Error updating category:", error);
                    res.status(500).json({ error: "Lỗi server khi cập nhật danh mục" });
                }
            }
        };
        this.deleteCategory = async (req, res) => {
            try {
                const categoryId = parseInt(req.params.id || "0");
                if (isNaN(categoryId)) {
                    res.status(400).json({ error: "Invalid category ID" });
                    return;
                }
                await this.categoryService.deleteCategory(categoryId);
                res.json({
                    success: true,
                    message: "Xóa danh mục thành công",
                });
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    res
                        .status(error.statusCode)
                        .json({ error: error.message, code: error.code });
                }
                else {
                    console.error("Error deleting category:", error);
                    res.status(500).json({ error: "Lỗi server khi xóa danh mục" });
                }
            }
        };
    }
};
exports.CategoryController = CategoryController;
exports.CategoryController = CategoryController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(CategoryService_1.CategoryService)),
    __metadata("design:paramtypes", [CategoryService_1.CategoryService])
], CategoryController);
//# sourceMappingURL=CategoryController.js.map