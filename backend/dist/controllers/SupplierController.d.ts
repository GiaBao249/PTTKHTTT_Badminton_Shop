import { SupplierService } from "../services/SupplierService";
import { Request, Response } from "express";
export declare class SupplierController {
    private supplierService;
    constructor(supplierService: SupplierService);
    getAllSuppliers: (req: Request, res: Response) => Promise<void>;
    getSupplierById: (req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=SupplierController.d.ts.map