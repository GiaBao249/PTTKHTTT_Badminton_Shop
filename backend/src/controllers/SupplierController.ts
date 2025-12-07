import { inject, injectable } from "tsyringe";
import { SupplierService } from "../services/SupplierService";
import { AppError } from "../middleware/errorHandler";
import { Request, Response } from "express";
@injectable()
export class SupplierController {
  constructor(
    @inject(SupplierService) private supplierService: SupplierService
  ) {}
  getAllSuppliers = async (req: Request, res: Response): Promise<void> => {
    try {
      const suppliers = await this.supplierService.getAllSuppliers();
      res.json(suppliers);
    } catch (error: any) {
      if (error instanceof AppError) {
        res
          .status(error.statusCode)
          .json({ error: error.message, code: error.code });
      } else {
        console.error("Error getting suppliers:", error);
        res.status(500).json({ error: "Lỗi server khi lấy nhà cung cấp" });
      }
    }
  };
  getSupplierById = async (req: Request, res: Response): Promise<void> => {
    try {
      const supplierId = parseInt(req.params.id);
      if (isNaN(supplierId)) {
        res.status(400).json({ error: "Invalid supplier Id" });
        return;
      }
      const supplier = await this.supplierService.getSupplierById(supplierId);
      res.json(supplier);
    } catch (error: any) {
      if (error instanceof AppError) {
        res
          .status(error.statusCode)
          .json({ error: error.message, code: error.code });
      } else {
        console.error("Error getting supplier:", error);
        res.status(500).json({ error: "Lỗi server khi lấy nhà cung cấp" });
      }
    }
  };
}
