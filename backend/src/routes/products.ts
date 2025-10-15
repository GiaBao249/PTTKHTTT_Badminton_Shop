import express, { Request, Response } from "express";
import { ProductModel } from "../models/Product";

const router = express.Router();

// GET /api/products - Lấy tất cả sản phẩm
router.get("/", async (req: Request, res: Response) => {
  try {
    const products = await ProductModel.getAll();
    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách sản phẩm",
    });
  }
});

// GET /api/products/:id - Lấy sản phẩm theo ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id!);
    const product = await ProductModel.getById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm",
      });
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thông tin sản phẩm",
    });
  }
});

// GET /api/products/category/:categoryId - Lấy sản phẩm theo danh mục
router.get("/category/:categoryId", async (req: Request, res: Response) => {
  try {
    const categoryId = parseInt(req.params.categoryId!);
    const products = await ProductModel.getByCategory(categoryId);

    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("Error fetching products by category:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy sản phẩm theo danh mục",
    });
  }
});

// POST /api/products - Tạo sản phẩm mới
router.post("/", async (req: Request, res: Response) => {
  try {
    const productId = await ProductModel.create(req.body);
    res.status(201).json({
      success: true,
      message: "Tạo sản phẩm thành công",
      data: { Product_id: productId },
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi tạo sản phẩm",
    });
  }
});

// PUT /api/products/:id - Cập nhật sản phẩm
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id!);
    const success = await ProductModel.update(id, req.body);

    if (!success) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm hoặc không có gì để cập nhật",
      });
    }

    res.json({
      success: true,
      message: "Cập nhật sản phẩm thành công",
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật sản phẩm",
    });
  }
});

// DELETE /api/products/:id - Xóa sản phẩm
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id!);
    const success = await ProductModel.delete(id);

    if (!success) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm",
      });
    }

    res.json({
      success: true,
      message: "Xóa sản phẩm thành công",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa sản phẩm",
    });
  }
});

export default router;
