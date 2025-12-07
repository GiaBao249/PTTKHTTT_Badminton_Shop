import { injectable } from "tsyringe";
import { supabase } from "../config/supabase";

@injectable()
export class CancelOrderRepository {
  /**
   * Lấy order theo ID
   */
  async getOrderById(
    orderId: number
  ): Promise<{ order_id: number; customer_id: number; status: string } | null> {
    const { data, error } = await supabase
      .from("orders")
      .select("order_id, customer_id, status")
      .eq("order_id", orderId)
      .single();

    if (error || !data) return null;
    return data;
  }

  /**
   * Lấy order details
   */
  async getOrderDetails(
    orderId: number
  ): Promise<Array<{ product_item_id: number; quantity: number }>> {
    const { data, error } = await supabase
      .from("orderdetail")
      .select("product_item_id, quantity")
      .eq("order_id", orderId);

    if (error) throw error;
    return data ?? [];
  }

  /**
   * Lấy quantity của product item
   */
  async getProductItemQuantity(
    productItemId: number
  ): Promise<number | null> {
    const { data, error } = await supabase
      .from("product_item")
      .select("quantity")
      .eq("product_item_id", productItemId)
      .single();

    if (error) return null;
    return data?.quantity ?? null;
  }

  /**
   * Cập nhật quantity của product item
   */
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

  /**
   * Cập nhật order status
   */
  async updateOrderStatus(
    orderId: number,
    status: string
  ): Promise<any> {
    const { data, error } = await supabase
      .from("orders")
      .update({ status })
      .eq("order_id", orderId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

