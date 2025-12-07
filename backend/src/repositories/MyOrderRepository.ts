import { injectable } from "tsyringe";
import { supabase } from "../config/supabase";
import { MyOrder } from "../models/MyOrder";

@injectable()
export class MyOrderRepository {
  /**
   * Lấy orders của customer
   */
  async getOrdersByCustomerId(customerId: number): Promise<MyOrder[]> {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("customer_id", customerId);

    if (error) throw error;
    return data ?? [];
  }

  /**
   * Lấy order details theo order IDs
   */
  async getOrderDetailsByOrderIds(
    orderIds: number[]
  ): Promise<Array<{ order_id: number; product_item_id: number; quantity: number }>> {
    if (orderIds.length === 0) return [];

    const { data, error } = await supabase
      .from("orderdetail")
      .select("order_id, product_item_id, quantity")
      .in("order_id", orderIds);

    if (error) throw error;
    return data ?? [];
  }

  /**
   * Lấy product items với product info
   */
  async getProductItemsWithProducts(
    productItemIds: number[]
  ): Promise<any[]> {
    if (productItemIds.length === 0) return [];

    const { data, error } = await supabase
      .from("product_item")
      .select(
        `
        product_item_id,
        product_id,
        product:product_id(
          product_id,
          product_name,
          category:category_id(
            category_id,
            category_name
          )
        )
      `
      )
      .in("product_item_id", productItemIds);

    if (error) throw error;
    return data ?? [];
  }
}

