import { injectable, inject } from "tsyringe";
import { Request, Response } from "express";
import { CustomerService } from "../services/CustomerService";
import { AppError } from "../middleware/errorHandler";

@injectable()
export class CustomerController {
  constructor(
    @inject(CustomerService) private customerService: CustomerService
  ) {}

  getAllCustomers = async (req: Request, res: Response): Promise<void> => {
    try {
      const customers = await this.customerService.getAllCustomerWithStats();
      res.json(customers);
    } catch (error: any) {
      if (error instanceof AppError) {
        res
          .status(error.statusCode)
          .json({ error: error.message, code: error.code });
      } else {
        console.error("Error getting customers:", error);
        res
          .status(500)
          .json({ error: "Lỗi server khi lấy danh sách khách hàng" });
      }
    }
  };

  getCustomerById = async (req: Request, res: Response): Promise<void> => {
    try {
      const customerId = parseInt(req.params.id);
      if (isNaN(customerId)) {
        res.status(400).json({ error: "Invalid customer ID" });
        return;
      }

      const customer = await this.customerService.getCustomerByIdWithStats(
        customerId
      );
      res.json(customer);
    } catch (error: any) {
      if (error instanceof AppError) {
        res
          .status(error.statusCode)
          .json({ error: error.message, code: error.code });
      } else {
        console.error("Error getting customer:", error);
        res.status(500).json({ error: "Lỗi server khi lấy khách hàng" });
      }
    }
  };
}
