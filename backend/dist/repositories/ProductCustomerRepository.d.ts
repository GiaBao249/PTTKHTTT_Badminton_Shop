import { Variation, FilterDto } from "../models/ProductCustomer";
export declare class ProductCustomerRepository {
    /**
     * Lấy tất cả products (không deleted)
     */
    findAll(): Promise<any[]>;
    /**
     * Lấy products theo category
     */
    findByCategory(categoryId: number): Promise<any[]>;
    /**
     * Search products
     */
    search(keyword: string): Promise<any[]>;
    /**
     * Filter products
     */
    filter(filterDto: FilterDto): Promise<any[]>;
    /**
     * Lấy featured products (limit 4)
     */
    findFeatured(limit?: number): Promise<any[]>;
    /**
     * Lấy product detail theo ID
     */
    findDetailById(productId: number): Promise<any | null>;
    /**
     * Lấy product items với images và configurations
     */
    getProductItemsWithDetails(productId: number): Promise<any[]>;
    /**
     * Lấy product items với quantity và images
     */
    getProductItemsWithQuantityAndImages(productIds: number[]): Promise<{
        quantityMap: Map<number, number>;
        thumbnailMap: Map<number, string>;
    }>;
    /**
     * Lấy variations theo category
     */
    getVariationsByCategory(categoryId: number): Promise<Variation[]>;
    /**
     * Đếm products
     */
    count(categoryId?: number): Promise<number>;
    /**
     * Lấy top products by category với sold quantity
     */
    getTopByCategories(categoryIds: number[]): Promise<any[]>;
    /**
     * Lấy product items với images cho top products
     */
    getProductItemsForTop(productIds: number[]): Promise<{
        items: any[];
        thumbnailMap: Map<number, string>;
        inventoryMap: Map<number, number>;
    }>;
    /**
     * Lấy order details để tính sold quantity
     */
    getOrderDetailsByProductItemIds(productItemIds: number[]): Promise<Array<{
        product_item_id: number;
        quantity: number;
    }>>;
    /**
     * Lấy product items với configurations để filter
     */
    getProductItemsWithConfigurations(productIds: number[]): Promise<any[]>;
    /**
     * Lấy specification của product
     */
    getProductSpecification(productId: number): Promise<Array<{
        name: string;
        value: string;
    }>>;
}
//# sourceMappingURL=ProductCustomerRepository.d.ts.map