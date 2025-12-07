import { injectable } from "tsyringe";
import { supabase } from "../config/supabase";
import { start } from "repl";

@injectable()
export class StatisticsRepository {
  async getCompletedOrders(): Promise<
    Array<{ total_amount: number; order_date: string }>
  > {
    const { data, error } = await supabase
      .from("orders")
      .select("total_amount, order_date")
      .in("status", ["Shipped", "Delivered"]);
    if (error) throw error;
    return data ?? [];
  }
  async getAllOrders(): Promise<
    Array<{ status: string; total_amount: number; order_date: string }>
  > {
    const { data, error } = await supabase
      .from("orders")
      .select("order_id , status, total_amount , order_date");
    if (error) throw error;
    return data ?? [];
  }
  async getOrderByDateRange(
    startDate?: string,
    endDate?: string
  ): Promise<
    Array<{ total_amount: number; status: string; order_date: string }>
  > {
    let query = supabase
      .from("orders")
      .select("order_id, total_amount, status, order_date");
    if (startDate && endDate)
      query = query.gte("order_date", startDate).lte("order_date", endDate);
    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
  }
  async getProductsCount(): Promise<number> {
    const { count, error } = await supabase
      .from("product")
      .select("product_id", { count: "exact", head: true })
      .or("is_deleted.is.null, is_deleted.eq.false");
    if (error) throw error;
    return count ?? 0;
  }
  async getProductItems(): Promise<Array<{ quantity: number }>> {
    const { data, error } = await supabase
      .from("product_item")
      .select("quantity");
    if (error) throw error;
    return data ?? [];
  }
  async getCustomerCount(): Promise<number> {
    const { count, error } = await supabase
      .from("customer")
      .select("customer_id", { count: "exact", head: true });
    if (error) throw error;
    return count ?? 0;
  }
  async getPurchaseOrdersCount(
    startDate?: string,
    endDate?: string
  ): Promise<number> {
    let query = supabase
      .from("purchaseorders")
      .select("purchaseorder_id", { count: "exact", head: true });
    if (startDate && endDate) {
      query = query
        .gte("purchaseorder_date", startDate)
        .lte("purchaseorder_date", endDate);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data?.length ?? 0;
  }
}
