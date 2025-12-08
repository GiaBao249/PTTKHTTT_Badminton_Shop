import { injectable, inject } from "tsyringe";
import { Request, Response } from "express";
import { AdminAccountService } from "../services/AdminAccountService";
import { AppError } from "../middleware/errorHandler";

@injectable()
export class AdminAccountController {
  constructor(
    @inject(AdminAccountService)
    private adminAccountService: AdminAccountService
  ) {}

  getAllAdminAccounts = async (req: Request, res: Response): Promise<void> => {
    try {
      const accounts = await this.adminAccountService.getAllAdminAccounts();
      res.json(accounts);
    } catch (error: any) {
      if (error instanceof AppError) {
        res
          .status(error.statusCode)
          .json({ error: error.message, code: error.code });
      } else {
        console.error("Error getting admin accounts:", error);
        res.status(500).json({ error: "Lỗi server khi lấy danh sách admin" });
      }
    }
  };

  getAdminAccountById = async (req: Request, res: Response): Promise<void> => {
    try {
      const accountId = parseInt(req.params.id || "0");
      if (isNaN(accountId)) {
        res.status(400).json({ error: "Invalid admin account ID" });
        return;
      }

      const account = await this.adminAccountService.getAdminAccountById(
        accountId
      );
      res.json(account);
    } catch (error: any) {
      if (error instanceof AppError) {
        res
          .status(error.statusCode)
          .json({ error: error.message, code: error.code });
      } else {
        console.error("Error getting admin account:", error);
        res.status(500).json({ error: "Lỗi server khi lấy tài khoản admin" });
      }
    }
  };
}
