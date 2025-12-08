import { Supplier } from "../models/Supplier";
export declare class SupplierRepository {
    findAll(): Promise<Supplier[]>;
    findById(supplierId: number): Promise<Supplier | null>;
    findByIds(supplierId: number[]): Promise<Supplier[]>;
}
//# sourceMappingURL=SupplierRepository.d.ts.map