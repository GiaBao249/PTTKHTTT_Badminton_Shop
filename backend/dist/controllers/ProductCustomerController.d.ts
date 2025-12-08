import { Request, Response } from "express";
import { ProductCustomerService } from "../services/ProductCustomerService";
export declare class ProductCustomerController {
    private productCustomerService;
    constructor(productCustomerService: ProductCustomerService);
    /**
     * GET /api/products/
     * Lấy tất cả products
     */
    getAllProducts: (req: Request, res: Response) => Promise<void>;
    /**
     * GET /api/products/category/:categoryId
     * Lấy products theo category
     */
    getProductsByCategory: (req: Request, res: Response) => Promise<void>;
    /**
     * GET /api/products/search/:keyword
     * Search products
     */
    searchProducts: (req: Request, res: Response) => Promise<void>;
    /**
     * POST /api/products/filter
     * Filter products
     */
    filterProducts: (req: Request, res: Response) => Promise<void>;
    /**
     * GET /api/products/featured-products
     * Lấy featured products
     */
    getFeaturedProducts: (req: Request, res: Response) => Promise<void>;
    /**
     * GET /api/products/:id
     * Lấy product detail
     */
    getProductDetail: (req: Request, res: Response) => Promise<void>;
    /**
     * GET /api/products/category/:categoryId/variations
     * Lấy variations theo category
     */
    getVariationsByCategory: (req: Request, res: Response) => Promise<void>;
    /**
     * GET /api/products/count?category=&categoryId=
     * Đếm products
     */
    countProducts: (req: Request, res: Response) => Promise<void>;
    /**
     * GET /api/products/top-by-categories
     * Lấy top products by category
     */
    getTopByCategories: (req: Request, res: Response) => Promise<void>;
    /**
     * GET /api/products/:id/specification
     * Lấy specification của product
     */
    getProductSpecification: (req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=ProductCustomerController.d.ts.map