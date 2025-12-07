import express from "express";
import { container } from "tsyringe";
import { ProductCustomerController } from "../controllers/ProductCustomerController";

const router = express.Router();

// Resolve dependency
const productCustomerController = container.resolve(ProductCustomerController);

// ========== PRODUCT ROUTES (Customer-facing) ==========
// GET /api/products/ - Lấy tất cả products
router.get("/", productCustomerController.getAllProducts);

// GET /api/products/category/:categoryId - Lấy products theo category
router.get(
  "/category/:categoryId",
  productCustomerController.getProductsByCategory
);

// GET /api/products/search/:keyword - Search products
router.get("/search/:keyword", productCustomerController.searchProducts);

// POST /api/products/filter - Filter products
router.post("/filter", productCustomerController.filterProducts);

// GET /api/products/featured-products - Lấy featured products (limit 4)
router.get("/featured-products", productCustomerController.getFeaturedProducts);

// GET /api/products/top-by-categories - Lấy top products by category
router.get("/top-by-categories", productCustomerController.getTopByCategories);

// GET /api/products/category/:categoryId/variations - Lấy variations theo category
router.get(
  "/category/:categoryId/variations",
  productCustomerController.getVariationsByCategory
);

// GET /api/products/count?category=&categoryId= - Đếm products
router.get("/count", productCustomerController.countProducts);

// GET /api/products/:id - Lấy product detail
router.get("/:id", productCustomerController.getProductDetail);

// GET /api/products/:id/specification - Lấy specification của product
router.get("/:id/specification", productCustomerController.getProductSpecification);

export default router;
