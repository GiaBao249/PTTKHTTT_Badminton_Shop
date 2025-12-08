export interface TopSellingProduct {
    product_id: number;
    product_name: string;
    price: number;
    sold_quantity: number;
    thumbnail: string | null;
}
export interface Product {
    product_id: number;
    supplier_id?: number;
    category_id: number;
    product_name: string;
    price: number;
    price_purchase?: number;
    description?: string;
    warranty_period?: number;
    is_deleted?: boolean;
    thumbnail?: string | null;
}
export interface ProductItem {
    product_item_id: number;
    product_id: number;
    quantity: number;
    variation_option_ids?: number[];
}
export interface CreateProductDto {
    product_name: string;
    category_id: number;
    supplier_id?: number;
    price: number;
    price_purchase?: number;
    description?: string;
    warranty_period?: number;
    items: Array<{
        variation_option_ids?: number[];
    }>;
}
export interface UpdateProductDto {
    product_name: string;
    category_id: number;
    price: number;
}
//# sourceMappingURL=Product.d.ts.map