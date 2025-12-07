import { injectable } from "tsyringe";
import { Order, OrderDetail } from "../models/Order";
import { supabase } from "../config/supabase";

@injectable()
export class OrderRepository {
  async findRecent(limit: number = 5): Promise<Order[]> {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("order_date", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data ?? [];
  }
  async findAll(): Promise<Order[]> {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("order_id", { ascending: false });

    if (error) throw error;
    return data ?? [];
  }

  async findById(orderId: number): Promise<Order | null> {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("order_id", orderId)
      .single();

    if (error) throw error;
    return data;
  }

  async getOrderDetailsByOrderId(orderId: number): Promise<OrderDetail[]> {
    const { data, error } = await supabase
      .from("orderdetail")
      .select("*")
      .eq("order_id", orderId);

    if (error) throw error;
    return data ?? [];
  }

  async getOrderStatus(orderId: number): Promise<string | null> {
    const { data, error } = await supabase
      .from("orders")
      .select("status")
      .eq("order_id", orderId)
      .single();

    if (error) throw error;
    return data?.status || null;
  }

  async updateStatus(orderId: number, status: string): Promise<Order> {
    const { data, error } = await supabase
      .from("orders")
      .update({ status })
      .eq("order_id", orderId)
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      throw new Error("Không tìm thấy đơn hàng sau khi cập nhật");
    }
    return data;
  }

  async getProductItemQuantity(productItemId: number): Promise<number | null> {
    const { data, error } = await supabase
      .from("product_item")
      .select("quantity")
      .eq("product_item_id", productItemId)
      .single();

    if (error) throw error;
    return data?.quantity ?? null;
  }

  async updateProductItemQuantity(
    productItemId: number,
    newQuantity: number
  ): Promise<void> {
    const { error } = await supabase
      .from("product_item")
      .update({ quantity: newQuantity })
      .eq("product_item_id", productItemId);

    if (error) throw error;
  }
}
