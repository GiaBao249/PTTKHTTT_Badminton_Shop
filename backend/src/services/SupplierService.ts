import { injectable, inject } from "tsyringe";
import { SupplierRepository } from "../repositories/SupplierRepository";
import { Supplier } from "../models/Supplier";
import { AppError } from "../middleware/errorHandler";

@injectable()
export class SupplierService {
  constructor(
    @inject(SupplierRepository) private supplierRepo: SupplierRepository
  ) {}
  async getAllSuppliers(): Promise<Supplier[]> {
    return await this.supplierRepo.findAll();
  }
  async getSupplierById(supplierId: number): Promise<Supplier> {
    const supplier = await this.supplierRepo.findById(supplierId);
    if (!supplier) {
      throw new AppError(
        404,
        "Không tìm thấy nhà cung cấp",
        "SUPPLIER_NOT_FOUND"
      );
    }
    return supplier;
  }
}
