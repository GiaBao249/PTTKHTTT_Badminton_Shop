import { DashboardRepository } from "../repositories/DashboardRepository";
import { DashboardStats } from "../models/Dashboard";
export declare class DashboardService {
    private dashboardRepo;
    constructor(dashboardRepo: DashboardRepository);
    getDashboardStats(): Promise<DashboardStats>;
}
//# sourceMappingURL=DashboardService.d.ts.map