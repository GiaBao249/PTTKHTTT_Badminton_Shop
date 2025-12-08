import { AdminAccountRepository } from "../repositories/AdminAccountRepository";
import { AdminAccount } from "../models/AdminAccount";
export declare class AdminAccountService {
    private adminAccountRepo;
    constructor(adminAccountRepo: AdminAccountRepository);
    getAllAdminAccounts(): Promise<AdminAccount[]>;
    getAdminAccountById(accountId: number): Promise<AdminAccount>;
}
//# sourceMappingURL=AdminAccountService.d.ts.map