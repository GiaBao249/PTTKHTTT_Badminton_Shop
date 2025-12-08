import { injectable, inject } from "tsyringe";
import { Request, Response } from "express";
import { CategoryService } from "../services/CategoryService";
import { CreateCategoryDto, UpdateCategoryDto } from "../models/Category";
import { AppError } from "../middleware/errorHandler";
@injectable()
export class CategoryController {
  constructor(
    @inject(CategoryService) private categoryService: CategoryService
  ) {}
  getAllCategories = async (req: Request, res: Response): Promise<void> => {
    try {
      const categories = await this.categoryService.getAllCategories();
      res.json(categories);
    } catch (error: any) {
      if (error instanceof AppError) {
        res
          .status(error.statusCode)
          .json({ error: error.message, code: error.code });
      } else {
        console.error("Error getting categories:", error);
        res.status(500).json({ error: "Lỗi server khi lấy danh mục" });
      }
    }
  };
  getCategoryById = async (req: Request, res: Response): Promise<void> => {
    try {
      const categoryId = parseInt(req.params.id);
      if (isNaN(categoryId)) {
        res.status(400).json({ error: "Invalid category ID" });
        return;
      }

      const category = await this.categoryService.getCategoryById(categoryId);
      res.json(category);
    } catch (error: any) {
      if (error instanceof AppError) {
        res
          .status(error.statusCode)
          .json({ error: error.message, code: error.code });
      } else {
        console.error("Error getting category:", error);
        res.status(500).json({ error: "Lỗi server khi lấy danh mục" });
      }
    }
  };
  createCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const dto: CreateCategoryDto = req.body;
      const category = await this.categoryService.createCategory(dto);
      res.status(200).json({
        success: true,
        category,
        message: "Tạo danh mục thành công",
      });
    } catch (error) {
      if (error instanceof AppError) {
        res
          .status(error.statusCode)
          .json({ error: error.message, code: error.code });
      } else {
        console.error("Error creating category:", error);
        res.status(500).json({ error: "Lỗi server khi tạo danh mục" });
      }
    }
  };
  updateCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const dto: UpdateCategoryDto = req.body;
      const categoryId = parseInt(req.params.id);
      if (isNaN(categoryId)) {
        res.status(400).json({ error: "Invalid category id" });
        return;
      }
      const category = await this.categoryService.updateCategory(
        categoryId,
        dto
      );
      res.json({
        success: true,
        category,
        message: "Cập nhật danh mục thành công",
      });
    } catch (error) {
      if (error instanceof AppError) {
        res
          .status(error.statusCode)
          .json({ error: error.message, code: error.code });
      } else {
        console.error("Error updating category:", error);
        res.status(500).json({ error: "Lỗi server khi cập nhật danh mục" });
      }
    }
  };
  deleteCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const categoryId = parseInt(req.params.id);
      if (isNaN(categoryId)) {
        res.status(400).json({ error: "Invalid category ID" });
        return;
      }

      await this.categoryService.deleteCategory(categoryId);
      res.json({
        success: true,
        message: "Xóa danh mục thành công",
      });
    } catch (error: any) {
      if (error instanceof AppError) {
        res
          .status(error.statusCode)
          .json({ error: error.message, code: error.code });
      } else {
        console.error("Error deleting category:", error);
        res.status(500).json({ error: "Lỗi server khi xóa danh mục" });
      }
    }
  };
}
