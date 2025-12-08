import { ProductRepository } from "../repositories/ProductRepository";
import { Product, ProductItem, CreateProductDto, UpdateProductDto } from "../models/Product";
export declare class ProductService {
    private productRepo;
    constructor(productRepo: ProductRepository);
    getAllProducts(): Promise<Product[]>;
    getProductById(productId: number): Promise<Product>;
    createProduct(createDto: CreateProductDto): Promise<{
        product: Product;
        product_items: Array<{
            product_item_id: number;
            variation_option_ids: number[];
        }>;
    }>;
    updateProduct(productId: number, updateDto: UpdateProductDto): Promise<Product>;
    deleteProduct(productId: number): Promise<void>;
    getAllProductItems(): Promise<ProductItem[]>;
}
//# sourceMappingURL=ProductService.d.ts.map