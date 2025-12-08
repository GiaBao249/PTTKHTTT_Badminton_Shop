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
exports.CategoryService = void 0;
const tsyringe_1 = require("tsyringe");
const CategoryRepository_1 = require("../repositories/CategoryRepository");
const errorHandler_1 = require("../middleware/errorHandler");
let CategoryService = class CategoryService {
    constructor(categoryRepo) {
        this.categoryRepo = categoryRepo;
    }
    async getAllCategories() {
        return await this.categoryRepo.findAll();
    }
    async getCategoryById(categoryId) {
        const category = await this.categoryRepo.findById(categoryId);
        if (!category) {
            throw new errorHandler_1.AppError(404, "Không tìm thấy danh mục", "CATEGORY_NOT_FOUND");
        }
        return category;
    }
    async createCategory(dto) {
        if (!dto.category_name || dto.category_name.trim() === "") {
            throw new errorHandler_1.AppError(400, "Tên danh mục không thể để trống", "INVALID_VALUE");
        }
        const existing = await this.categoryRepo.findAll();
        const duplicate = existing.find((c) => c.category_name.toLowerCase() === dto.category_name.toLocaleLowerCase());
        if (duplicate) {
            throw new errorHandler_1.AppError(400, "Danh mục đã tồn tài", "DUPLICATE_CATEGORY");
        }
        return await this.categoryRepo.create({ category_name: dto.category_name });
    }
    async updateCategory(categoryId, dto) {
        const existing = await this.categoryRepo.findById(categoryId);
        if (!existing) {
            throw new errorHandler_1.AppError(400, "Không tìm thấy danh mục", "INVALID_VALUE");
        }
        if (dto.category_name && dto.category_name.trim() === "") {
            throw new errorHandler_1.AppError(400, "Tên danh mục không thể để trống", "INVALID_VALUE");
        }
        return await this.categoryRepo.update(categoryId, dto);
    }
    async deleteCategory(categoryId) {
        const existing = await this.categoryRepo.findById(categoryId);
        if (!existing) {
            throw new errorHandler_1.AppError(400, "Không tìm thấy danh mục", "INVALID_VALUE");
        }
        await this.categoryRepo.delete(categoryId);
    }
};
exports.CategoryService = CategoryService;
exports.CategoryService = CategoryService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(CategoryRepository_1.CategoryRepository)),
    __metadata("design:paramtypes", [CategoryRepository_1.CategoryRepository])
], CategoryService);
//# sourceMappingURL=CategoryService.js.map