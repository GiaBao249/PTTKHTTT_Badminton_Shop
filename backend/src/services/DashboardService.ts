import { injectable, inject } from "tsyringe";
import { DashboardRepository } from "../repositories/DashboardRepository";
import { DashboardStats } from "../models/Dashboard";
@injectable()
export class DashboardService {
  constructor(
    @inject(DashboardRepository) private dashboardRepo: DashboardRepository
  ) {}
  async getDashboardStats(): Promise<DashboardStats> {
    const { orders, totalCustomers, totalProducts } =
      await this.dashboardRepo.getAllStatsData();

    const totalOrders = orders.length;
    const totalRevenue = orders
      .filter(
        (order) => order.status === "Shipped" || order.status === "Delivered"
      )
      .reduce((sum, order) => sum + (order.total_amount || 0), 0);
    return {
      totalOrders,
      totalCustomers,
      totalProducts,
      totalRevenue,
    };
  }
}
