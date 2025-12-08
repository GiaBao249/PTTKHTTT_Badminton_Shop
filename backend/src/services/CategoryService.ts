import { injectable, inject } from "tsyringe";
import { CategoryRepository } from "../repositories/CategoryRepository";
import {
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
} from "../models/Category";
import { AppError } from "../middleware/errorHandler";

@injectable()
export class CategoryService {
  constructor(
    @inject(CategoryRepository) private categoryRepo: CategoryRepository
  ) {}
  async getAllCategories(): Promise<Category[]> {
    return await this.categoryRepo.findAll();
  }
  async getCategoryById(categoryId: number): Promise<Category> {
    const category = await this.categoryRepo.findById(categoryId);
    if (!category) {
      throw new AppError(404, "Không tìm thấy danh mục", "CATEGORY_NOT_FOUND");
    }
    return category;
  }
  async createCategory(dto: CreateCategoryDto): Promise<Category> {
    if (!dto.category_name || dto.category_name.trim() === "") {
      throw new AppError(
        400,
        "Tên danh mục không thể để trống",
        "INVALID_VALUE"
      );
    }
    const existing = await this.categoryRepo.findAll();
    const duplicate = existing.find(
      (c) =>
        c.category_name.toLowerCase() === dto.category_name.toLocaleLowerCase()
    );
    if (duplicate) {
      throw new AppError(400, "Danh mục đã tồn tài", "DUPLICATE_CATEGORY");
    }
    return await this.categoryRepo.create({ category_name: dto.category_name });
  }

  async updateCategory(categoryId: number, dto: UpdateCategoryDto) {
    const existing = await this.categoryRepo.findById(categoryId);
    if (!existing) {
      throw new AppError(400, "Không tìm thấy danh mục", "INVALID_VALUE");
    }
    if (dto.category_name && dto.category_name.trim() === "") {
      throw new AppError(
        400,
        "Tên danh mục không thể để trống",
        "INVALID_VALUE"
      );
    }
    return await this.categoryRepo.update(categoryId, dto);
  }
  async deleteCategory(categoryId: number) {
    const existing = await this.categoryRepo.findById(categoryId);
    if (!existing) {
      throw new AppError(400, "Không tìm thấy danh mục", "INVALID_VALUE");
    }
    await this.categoryRepo.delete(categoryId);
  }
}
