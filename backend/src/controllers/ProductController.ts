import { injectable, inject } from "tsyringe";
import { Request, Response } from "express";
import { ProductService } from "../services/ProductService";
import { AppError } from "../middleware/errorHandler";
import { CreateProductDto, UpdateProductDto } from "../models/Product";

@injectable()
export class ProductController {
  constructor(@inject(ProductService) private productService: ProductService) {}

  /**
   * GET /api/admin/getProducts
   */
  getAllProducts = async (req: Request, res: Response): Promise<void> => {
    try {
      const products = await this.productService.getAllProducts();
      res.json(products);
    } catch (error: any) {
      if (error instanceof AppError) {
        res
          .status(error.statusCode)
          .json({ error: error.message, code: error.code });
      } else {
        console.error("Error getting products:", error);
        res.status(500).json({ error: "Lỗi server khi lấy sản phẩm" });
      }
    }
  };

  /**
   * GET /api/admin/products/:id
   * Lấy product theo ID
   */
  getProductById = async (req: Request, res: Response): Promise<void> => {
    try {
      const productId = parseInt(req.params.id || "0");
      if (isNaN(productId)) {
        res.status(400).json({ error: "Invalid product ID" });
        return;
      }

      const product = await this.productService.getProductById(productId);
      res.json(product);
    } catch (error: any) {
      if (error instanceof AppError) {
        res
          .status(error.statusCode)
          .json({ error: error.message, code: error.code });
      } else {
        console.error("Error getting product:", error);
        res.status(500).json({ error: "Lỗi server khi lấy sản phẩm" });
      }
    }
  };

  /**
   * POST /api/admin/createProducts
   */
  createProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      const createDto: CreateProductDto = req.body;
      const result = await this.productService.createProduct(createDto);

      res.status(201).json({
        success: true,
        product: result.product,
        product_items: result.product_items,
        message: "Tạo sản phẩm thành công",
      });
    } catch (error: any) {
      if (error instanceof AppError) {
        res
          .status(error.statusCode)
          .json({ error: error.message, code: error.code });
      } else {
        console.error("Error creating product:", error);
        res.status(500).json({ error: "Lỗi server khi tạo sản phẩm" });
      }
    }
  };

  /**
   * PUT /api/admin/updateProduct/:id
   */
  updateProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      const productId = parseInt(req.params.id || "0");
      if (isNaN(productId)) {
        res.status(400).json({ error: "Invalid product ID" });
        return;
      }

      const updateDto: UpdateProductDto = req.body;
      const updatedProduct = await this.productService.updateProduct(
        productId,
        updateDto
      );

      res.json({
        success: true,
        product: updatedProduct,
        message: "Cập nhật sản phẩm thành công",
      });
    } catch (error: any) {
      if (error instanceof AppError) {
        res
          .status(error.statusCode)
          .json({ error: error.message, code: error.code });
      } else {
        console.error("Error updating product:", error);
        res.status(500).json({ error: "Lỗi server khi cập nhật sản phẩm" });
      }
    }
  };

  /**
   * DELETE /api/admin/deleteProduct/:id
   */
  deleteProduct = async (req: Request, res: Response): Promise<void> => {
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
    } catch (error: any) {
      if (error instanceof AppError) {
        res
          .status(error.statusCode)
          .json({ error: error.message, code: error.code });
      } else {
        console.error("Error deleting product:", error);
        res.status(500).json({ error: "Không thể xóa sản phẩm" });
      }
    }
  };

  /**
   * GET /api/admin/getProductsItem
   */
  getAllProductItems = async (req: Request, res: Response): Promise<void> => {
    try {
      const productItems = await this.productService.getAllProductItems();
      res.json(productItems);
    } catch (error: any) {
      if (error instanceof AppError) {
        res
          .status(error.statusCode)
          .json({ error: error.message, code: error.code });
      } else {
        console.error("Error getting product items:", error);
        res.status(500).json({ error: "Lỗi server khi lấy sản phẩm" });
      }
    }
  };
}
