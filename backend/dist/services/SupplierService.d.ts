import { SupplierRepository } from "../repositories/SupplierRepository";
import { Supplier } from "../models/Supplier";
export declare class SupplierService {
    private supplierRepo;
    constructor(supplierRepo: SupplierRepository);
    getAllSuppliers(): Promise<Supplier[]>;
    getSupplierById(supplierId: number): Promise<Supplier>;
}
//# sourceMappingURL=SupplierService.d.ts.map