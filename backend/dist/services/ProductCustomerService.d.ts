import { ProductCustomerRepository } from "../repositories/ProductCustomerRepository";
import { ProductCustomer, ProductDetail, Variation, TopByCategory, FilterDto } from "../models/ProductCustomer";
export declare class ProductCustomerService {
    private productCustomerRepo;
    constructor(productCustomerRepo: ProductCustomerRepository);
    /**
     * Lấy tất cả products với quantity và thumbnail
     */
    getAllProducts(): Promise<ProductCustomer[]>;
    /**
     * Lấy products theo category
     */
    getProductsByCategory(categoryId: number): Promise<ProductCustomer[]>;
    /**
     * Search products
     */
    searchProducts(keyword: string): Promise<ProductCustomer[]>;
    /**
     * Filter products
     */
    filterProducts(filterDto: FilterDto): Promise<ProductCustomer[]>;
    /**
     * Lấy featured products
     */
    getFeaturedProducts(limit?: number): Promise<ProductCustomer[]>;
    /**
     * Lấy product detail
     */
    getProductDetail(productId: number): Promise<ProductDetail>;
    /**
     * Lấy variations theo category
     */
    getVariationsByCategory(categoryId: number): Promise<Variation[]>;
    /**
     * Đếm products
     */
    countProducts(categoryId?: number): Promise<number>;
    /**
     * Lấy top products by category
     */
    getTopByCategories(categoryIds?: number[]): Promise<TopByCategory[]>;
    /**
     * Lấy specification của product
     */
    getProductSpecification(productId: number): Promise<Array<{
        name: string;
        value: string;
    }>>;
}
//# sourceMappingURL=ProductCustomerService.d.ts.map