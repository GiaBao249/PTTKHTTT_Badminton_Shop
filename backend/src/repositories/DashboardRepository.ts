import { inject, injectable } from "tsyringe";
import { supabase } from "../config/supabase";

@injectable()
export class DashboardRepository {
  async getOrdersForStats(): Promise<
    Array<{ total_amount: number; status: string }>
  > {
    const { data, error } = await supabase
      .from("orders")
      .select("total_amount, status");
    if (error) throw error;
    return data ?? [];
  }
  async getTotalCustomers(): Promise<number> {
    const { count, error } = await supabase
      .from("customer")
      .select("customer_id", { count: "exact", head: true });
    if (error) throw error;
    return count ?? 0;
  }
  async getTotalProducts(): Promise<number> {
    const { count, error } = await supabase
      .from("product")
      .select("product_id", { count: "exact", head: true })
      .or("is_deleted.is.null,is_deleted.eq.false");
    if (error) throw error;
    return count ?? 0;
  }
  async getAllStatsData(): Promise<{
    orders: Array<{ total_amount: number; status: string }>;
    totalCustomers: number;
    totalProducts: number;
  }> {
    const [orders, totalCustomers, totalProducts] = await Promise.all([
      this.getOrdersForStats(),
      this.getTotalCustomers(),
      this.getTotalProducts(),
    ]);
    return {
      orders,
      totalCustomers,
      totalProducts,
    };
  }
}
