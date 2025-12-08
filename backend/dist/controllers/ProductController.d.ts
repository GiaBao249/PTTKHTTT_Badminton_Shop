import { Request, Response } from "express";
import { ProductService } from "../services/ProductService";
export declare class ProductController {
    private productService;
    constructor(productService: ProductService);
    /**
     * GET /api/admin/getProducts
     */
    getAllProducts: (req: Request, res: Response) => Promise<void>;
    /**
     * GET /api/admin/products/:id
     * Lấy product theo ID
     */
    getProductById: (req: Request, res: Response) => Promise<void>;
    /**
     * POST /api/admin/createProducts
     */
    createProduct: (req: Request, res: Response) => Promise<void>;
    /**
     * PUT /api/admin/updateProduct/:id
     */
    updateProduct: (req: Request, res: Response) => Promise<void>;
    /**
     * DELETE /api/admin/deleteProduct/:id
     */
    deleteProduct: (req: Request, res: Response) => Promise<void>;
    /**
     * GET /api/admin/getProductsItem
     */
    getAllProductItems: (req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=ProductController.d.ts.map