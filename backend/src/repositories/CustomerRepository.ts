import { injectable } from "tsyringe";
import { Customer } from "../models/Customer";
import { supabase } from "../config/supabase";

@injectable()
export class CustomerRepository {
  async findAll(): Promise<Customer[]> {
    const { data, error } = await supabase.from("customer").select("*");
    if (error) {
      throw error;
    }
    return data ?? [];
  }
  async findById(customerId: number): Promise<Customer | null> {
    const { data, error } = await supabase
      .from("customer")
      .select("*")
      .eq("customer_id", customerId)
      .single();

    if (error) throw error;
    return data;
  }
  async getOrdersStats(): Promise<
    Map<number, { total_orders: number; total_spent: number }>
  > {
    const { data: orders, error } = await supabase
      .from("orders")
      .select("customer_id, total_amount, status");
    if (error) throw error;
    const statsMap = new Map<
      number,
      { total_orders: number; total_spent: number }
    >();
    (orders ?? []).forEach((order: any) => {
      const customerId = order.customer_id;
      if (!customerId) return;
      const entry = statsMap.get(customerId) || {
        total_orders: 0,
        total_spent: 0,
      };
      entry.total_orders += 1;
      if (order.total_amount) {
        entry.total_spent += Number(order.total_amount || 0);
      }
      statsMap.set(customerId, entry);
    });
    return statsMap;
  }
}
