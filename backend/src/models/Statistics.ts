export type PeriodType = "day" | "week" | "month" | "year";

export interface RevenueStatistics {
  revenue: Record<string, number>;
  orderCount: Record<string, number>;
  period: PeriodType;
  totalRevenue: number;
  totalOrders: number;
}

export interface ProductStatistics {
  totalProducts: number;
  totalQuantity: number;
  outOfStockProducts: number;
  inStockProducts: number;
}

export interface OrderStatistics {
  statusCount: Record<string, number>;
  statusRevenue: Record<string, number>;
  totalOrders: number;
}

export interface SummaryStatistics {
  totalOrders: number;
  completedOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  totalProducts: number;
  totalPurchaseOrders: number;
  period: { startDate: string; endDate: string } | null;
}
