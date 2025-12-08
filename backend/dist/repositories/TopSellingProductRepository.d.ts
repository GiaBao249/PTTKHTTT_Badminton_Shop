export declare class TopSellingProductRepository {
    getOrderDetails(): Promise<Array<{
        product_item_id: number;
        quantity: number;
    }>>;
    getProductItemsByIds(productItemsIds: number[]): Promise<Array<{
        product_item_id: number;
        product_id: number;
    }>>;
    getProductsWithImages(productIds: number[]): Promise<any[]>;
}
//# sourceMappingURL=TopSellingProductRepository.d.ts.map