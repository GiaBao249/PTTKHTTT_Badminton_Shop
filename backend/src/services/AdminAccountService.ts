import { injectable, inject } from "tsyringe";
import { AdminAccountRepository } from "../repositories/AdminAccountRepository";
import { AdminAccount } from "../models/AdminAccount";
import { AppError } from "../middleware/errorHandler";

@injectable()
export class AdminAccountService {
  constructor(
    @inject(AdminAccountRepository)
    private adminAccountRepo: AdminAccountRepository
  ) {}

  async getAllAdminAccounts(): Promise<AdminAccount[]> {
    const accounts = await this.adminAccountRepo.findAll();

    return accounts.map((account: any) => ({
      id: account.id,
      username: account.username,
      employee_id: account.employee_id,
      employee: {
        name: account.employees?.name || "",
      },
    }));
  }

  async getAdminAccountById(accountId: number): Promise<AdminAccount> {
    const account = await this.adminAccountRepo.findById(accountId);
    if (!account) {
      throw new AppError(
        404,
        "Không tìm thấy tài khoản admin",
        "ADMIN_ACCOUNT_NOT_FOUND"
      );
    }

    return {
      id: account.id,
      username: account.username,
      employee_id: account.employee_id,
      employee: {
        name: (account as any).employees?.name || "",
      },
    };
  }
}
