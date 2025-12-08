import { Request, Response } from "express";
import { AdminAccountService } from "../services/AdminAccountService";
export declare class AdminAccountController {
    private adminAccountService;
    constructor(adminAccountService: AdminAccountService);
    getAllAdminAccounts: (req: Request, res: Response) => Promise<void>;
    getAdminAccountById: (req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=AdminAccountController.d.ts.map