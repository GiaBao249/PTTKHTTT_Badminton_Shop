import { injectable, inject } from "tsyringe";
import { StatisticsRepository } from "../repositories/StatisticsRepository";
import {
  RevenueStatistics,
  ProductStatistics,
  OrderStatistics,
  SummaryStatistics,
  PeriodType,
} from "../models/Statistics";

@injectable()
export class StatisticsService {
  constructor(
    @inject(StatisticsRepository) private statisticsRepo: StatisticsRepository
  ) {}
  private getPeriodKey(date: Date, period: PeriodType): string {
    switch (period) {
      case "day":
        return date.toISOString().split("T")[0];
      case "week":
        const weekDate = new Date(date);
        const dayOfWeek = weekDate.getDay();
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        weekDate.setDate(weekDate.getDate() - daysToMonday);
        const year = weekDate.getFullYear();
        const jan1 = new Date(year, 0, 1);
        const jan1Day = jan1.getDay();
        const daysFromJan1 = Math.floor(
          (weekDate.getTime() - jan1.getTime()) / (24 * 60 * 60 * 1000)
        );
        let weekNumber = Math.floor((daysFromJan1 + jan1Day) / 7);
        if (jan1Day > 1) weekNumber += 1;
        return `${year}-W${String(weekNumber).padStart(2, "0")}`;
      case "month":
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
          2,
          "0"
        )}`;

      case "year":
        return String(date.getFullYear());

      default:
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
          2,
          "0"
        )}`;
    }
  }
  async getRevenueStatistics(
    period: PeriodType = "month"
  ): Promise<RevenueStatistics> {
    const orders = await this.statisticsRepo.getCompletedOrders();
    const revenueByPeriod: Record<string, number> = {};
    const orderCountByPeriod: Record<string, number> = {};
    orders.forEach((order) => {
      if (!order.order_date) return;
      const date = new Date(order.order_date);
      if (isNaN(date.getTime())) {
        console.warn("Invalid date: ", order.order_date);
        return;
      }
      const key = this.getPeriodKey(date, period);
      const amount = Number(order.total_amount) || 0;
      revenueByPeriod[key] = (revenueByPeriod[key] || 0) + amount;
      orderCountByPeriod[key] = (orderCountByPeriod[key] || 0) + 1;
    });
    const totalRevenue = Object.values(revenueByPeriod).reduce(
      (sum, val) => sum + val,
      0
    );
    return {
      revenue: revenueByPeriod,
      orderCount: orderCountByPeriod,
      period,
      totalRevenue,
      totalOrders: orders.length,
    };
  }
  async getProductStatistics(): Promise<ProductStatistics> {
    const [totalProducts, productItems] = await Promise.all([
      this.statisticsRepo.getProductsCount(),
      this.statisticsRepo.getProductItems(),
    ]);

    const totalQuantity = productItems.reduce(
      (sum, item) => sum + (item.quantity || 0),
      0
    );

    const outOfStockProducts = productItems.filter(
      (item) => (item.quantity || 0) === 0
    ).length;

    return {
      totalProducts,
      totalQuantity,
      outOfStockProducts,
      inStockProducts: totalProducts - outOfStockProducts,
    };
  }
  async getOrderStatistics(): Promise<OrderStatistics> {
    const orders = await this.statisticsRepo.getAllOrders();

    const statusCount: Record<string, number> = {};
    const statusRevenue: Record<string, number> = {};

    orders.forEach((order) => {
      const status = order.status || "Unknown";
      statusCount[status] = (statusCount[status] || 0) + 1;

      if (order.total_amount) {
        statusRevenue[status] =
          (statusRevenue[status] || 0) + (order.total_amount || 0);
      }
    });

    return {
      statusCount,
      statusRevenue,
      totalOrders: orders.length,
    };
  }
  async getSummaryStatistics(
    startDate?: string,
    endDate?: string
  ): Promise<SummaryStatistics> {
    const [orders, totalCustomers, totalProducts, totalPurchaseOrders] =
      await Promise.all([
        this.statisticsRepo.getOrderByDateRange(startDate, endDate),
        this.statisticsRepo.getCustomerCount(),
        this.statisticsRepo.getProductsCount(),
        this.statisticsRepo.getPurchaseOrdersCount(startDate, endDate),
      ]);

    const completedOrders = orders.filter(
      (o) => o.status === "Shipped" || o.status === "Delivered"
    );

    const totalRevenue = completedOrders.reduce(
      (sum, o) => sum + (o.total_amount || 0),
      0
    );

    return {
      totalOrders: orders.length,
      completedOrders: completedOrders.length,
      totalRevenue,
      totalCustomers,
      totalProducts,
      totalPurchaseOrders,
      period: startDate && endDate ? { startDate, endDate } : null,
    };
  }
}
