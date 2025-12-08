import { Product, ProductItem, UpdateProductDto } from "../models/Product";
export declare class ProductRepository {
    findAll(): Promise<Product[]>;
    findById(productId: number): Promise<Product | null>;
    getProductItemsWithImages(productIds: number[]): Promise<Map<number, string>>;
    create(productData: Partial<Product>): Promise<Product>;
    createProductItem(productId: number): Promise<ProductItem>;
    createProductConfigurations(productItemId: number, variationOptionIds: number[]): Promise<void>;
    update(productId: number, updateData: UpdateProductDto): Promise<Product>;
    softDelete(productId: number): Promise<void>;
    findAllProductItems(): Promise<ProductItem[]>;
}
//# sourceMappingURL=ProductRepository.d.ts.map