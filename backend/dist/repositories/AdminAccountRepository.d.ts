import { AdminAccount } from "../models/AdminAccount";
export declare class AdminAccountRepository {
    findAll(): Promise<AdminAccount[]>;
    findById(accountId: number): Promise<AdminAccount | null>;
}
//# sourceMappingURL=AdminAccountRepository.d.ts.map