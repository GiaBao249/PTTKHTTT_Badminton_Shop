import { Request, Response } from "express";
import { TopSellingProductService } from "../services/TopSellingProductService";
export declare class TopSellingProductController {
    private topSellingProductService;
    constructor(topSellingProductService: TopSellingProductService);
    getTopSellingProducts: (req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=TopSellingProductController.d.ts.map