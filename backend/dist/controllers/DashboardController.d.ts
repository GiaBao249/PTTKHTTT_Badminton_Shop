import { Request, Response } from "express";
import { DashboardService } from "../services/DashboardService";
export declare class DashboardController {
    private dashboardService;
    constructor(dashboardService: DashboardService);
    getDashboardStats: (req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=DashboardController.d.ts.map