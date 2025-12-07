import { injectable, inject } from "tsyringe";
import { Request, Response } from "express";
import { ProductCustomerService } from "../services/ProductCustomerService";
import { FilterDto } from "../models/ProductCustomer";
import { AppError } from "../middleware/errorHandler";

@injectable()
export class ProductCustomerController {
  constructor(
    @inject(ProductCustomerService)
    private productCustomerService: ProductCustomerService
  ) {}

  /**
   * GET /api/products/
   * Lấy tất cả products
   */
  getAllProducts = async (req: Request, res: Response): Promise<void> => {
    try {
      const products = await this.productCustomerService.getAllProducts();
      res.json(products);
    } catch (error: any) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          error: error.message,
          code: error.code,
        });
      } else {
        console.error("Error getting products:", error);
        res.status(500).json({ error: error.message || "Lỗi server" });
      }
    }
  };

  /**
   * GET /api/products/category/:categoryId
   * Lấy products theo category
   */
  getProductsByCategory = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const categoryId = parseInt(req.params.categoryId);
      if (isNaN(categoryId)) {
        res.status(400).json({ error: "Invalid category ID" });
        return;
      }

      const products =
        await this.productCustomerService.getProductsByCategory(categoryId);
      res.json(products);
    } catch (error: any) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          error: error.message,
          code: error.code,
        });
      } else {
        console.error("Error getting products by category:", error);
        res.status(500).json({ error: error.message || "Lỗi server" });
      }
    }
  };

  /**
   * GET /api/products/search/:keyword
   * Search products
   */
  searchProducts = async (req: Request, res: Response): Promise<void> => {
    try {
      const keyword = req.params.keyword;
      const products = await this.productCustomerService.searchProducts(keyword);
      res.json(products);
    } catch (error: any) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          error: error.message,
          code: error.code,
        });
      } else {
        console.error("Error searching products:", error);
        res.status(500).json({ error: error.message || "Lỗi server" });
      }
    }
  };

  /**
   * POST /api/products/filter
   * Filter products
   */
  filterProducts = async (req: Request, res: Response): Promise<void> => {
    try {
      const filterDto: FilterDto = req.body;
      const products = await this.productCustomerService.filterProducts(
        filterDto
      );
      res.json(products);
    } catch (error: any) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          error: error.message,
          code: error.code,
        });
      } else {
        console.error("Error filtering products:", error);
        res.status(500).json({ error: error.message || "Lỗi server" });
      }
    }
  };

  /**
   * GET /api/products/featured-products
   * Lấy featured products
   */
  getFeaturedProducts = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const products = await this.productCustomerService.getFeaturedProducts(4);
      res.json(products);
    } catch (error: any) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          error: error.message,
          code: error.code,
        });
      } else {
        console.error("Error getting featured products:", error);
        res.status(500).json({ error: error.message || "Lỗi server" });
      }
    }
  };

  /**
   * GET /api/products/:id
   * Lấy product detail
   */
  getProductDetail = async (req: Request, res: Response): Promise<void> => {
    try {
      const productId = parseInt(req.params.id);
      if (isNaN(productId)) {
        res.status(400).json({ error: "Invalid product ID" });
        return;
      }

      const product = await this.productCustomerService.getProductDetail(
        productId
      );
      res.json(product);
    } catch (error: any) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          error: error.message,
          code: error.code,
        });
      } else {
        console.error("Error getting product detail:", error);
        res.status(500).json({ error: error.message || "Lỗi server" });
      }
    }
  };

  /**
   * GET /api/products/category/:categoryId/variations
   * Lấy variations theo category
   */
  getVariationsByCategory = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const categoryId = parseInt(req.params.categoryId);
      if (isNaN(categoryId)) {
        res.status(400).json({ error: "Invalid category ID" });
        return;
      }

      const variations =
        await this.productCustomerService.getVariationsByCategory(categoryId);
      res.json(variations);
    } catch (error: any) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          error: error.message,
          code: error.code,
        });
      } else {
        console.error("Error getting variations:", error);
        res.status(500).json({ error: error.message || "Lỗi server" });
      }
    }
  };

  /**
   * GET /api/products/count?category=&categoryId=
   * Đếm products
   */
  countProducts = async (req: Request, res: Response): Promise<void> => {
    try {
      const { category, categoryId } = req.query as {
        category?: string;
        categoryId?: string;
      };

      const slugToId: Record<string, number> = {
        all: -1,
        rackets: 1,
        shoes: 2,
        clothes: 3,
        accessories: 4,
        shuttlecocks: 5,
      };

      let resolvedCategoryId: number | undefined = undefined;
      if (categoryId) {
        const parsed = Number(categoryId);
        resolvedCategoryId = Number.isFinite(parsed) ? parsed : undefined;
      } else if (category) {
        const key = String(category).toLowerCase();
        const id = slugToId[key];
        resolvedCategoryId = id && id > 0 ? id : undefined;
      }

      const count = await this.productCustomerService.countProducts(
        resolvedCategoryId
      );
      res.json({ count });
    } catch (error: any) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          error: error.message,
          code: error.code,
        });
      } else {
        console.error("Error counting products:", error);
        res.status(500).json({ error: error.message || "Lỗi server" });
      }
    }
  };

  /**
   * GET /api/products/top-by-categories
   * Lấy top products by category
   */
  getTopByCategories = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const topProducts = await this.productCustomerService.getTopByCategories();
      res.json(topProducts);
    } catch (error: any) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          error: error.message,
          code: error.code,
        });
      } else {
        console.error("Error getting top products:", error);
        res.status(500).json({ error: error.message || "Lỗi server" });
      }
    }
  };

  /**
   * GET /api/products/:id/specification
   * Lấy specification của product
   */
  getProductSpecification = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const productId = parseInt(req.params.id);
      if (isNaN(productId)) {
        res.status(400).json({ error: "Invalid product ID" });
        return;
      }

      const specs =
        await this.productCustomerService.getProductSpecification(productId);
      res.json(specs);
    } catch (error: any) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          error: error.message,
          code: error.code,
        });
      } else {
        console.error("Error getting product specification:", error);
        res.status(500).json({ error: error.message || "Lỗi server" });
      }
    }
  };
}

