import { TopSellingProductRepository } from "../repositories/TopSellingProductRepository";
import { TopSellingProduct } from "../models/Product";
export declare class TopSellingProductService {
    private productRepo;
    constructor(productRepo: TopSellingProductRepository);
    getTopSellingProducts(limit?: number): Promise<TopSellingProduct[]>;
}
//# sourceMappingURL=TopSellingProductService.d.ts.map