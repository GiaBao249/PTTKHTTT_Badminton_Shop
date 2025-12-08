import { injectable } from "tsyringe";
import { supabase } from "../config/supabase";
import { CheckoutItem, ShippingInfo } from "../models/Checkout";

@injectable()
export class CheckoutRepository {
  /**
   * Lấy product items theo IDs
   */
  async getProductItemsByIds(
    productItemIds: number[]
  ): Promise<Array<{ product_item_id: number; quantity: number }>> {
    if (productItemIds.length === 0) return [];

    const { data, error } = await supabase
      .from("product_item")
      .select("product_item_id, quantity")
      .in("product_item_id", productItemIds);

    if (error) throw error;
    return data ?? [];
  }

  /**
   * Tạo địa chỉ mới
   */
  async createAddress(
    customerId: number,
    shippingInfo: ShippingInfo
  ): Promise<number> {
    const { data, error } = await supabase
      .from("address")
      .insert({
        customer_id: customerId,
        address_line: shippingInfo.address,
        ward: shippingInfo.ward || "",
        district: shippingInfo.district,
        city: shippingInfo.city,
        postal_code: shippingInfo.postalCode || "",
      })
      .select("address_id")
      .single();

    if (error) throw error;
    if (!data) throw new Error("Không thể tạo địa chỉ");
    return data.address_id;
  }

  /**
   * Tạo order
   */
  async createOrder(
    customerId: number,
    addressId: number | null,
    totalAmount: number
  ): Promise<number> {
    const { data, error } = await supabase
      .from("orders")
      .insert({
        customer_id: customerId,
        address_id: addressId,
        status: "Pending",
        total_amount: totalAmount,
        order_date: new Date().toISOString(),
        delivery_date: null,
      })
      .select("order_id")
      .single();

    if (error) {
      console.error("Order error details:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      throw error;
    }

    if (!data) throw new Error("Không thể tạo đơn hàng");
    return data.order_id;
  }

  /**
   * Tạo order details
   */
  async createOrderDetails(
    orderId: number,
    cartItems: CheckoutItem[]
  ): Promise<void> {
    const orderDetails = cartItems.map((item) => ({
      order_id: orderId,
      product_item_id: item.product_item_id,
      quantity: item.quantity,
      amount: item.total_amount || item.quantity * (item.price || 0),
    }));

    const { error } = await supabase.from("orderdetail").insert(orderDetails);

    if (error) throw error;
  }

  /**
   * Cập nhật số lượng product item (trừ inventory)
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
   * Lấy cart của customer
   */
  async getCartByCustomerId(customerId: number): Promise<number | null> {
    const { data, error } = await supabase
      .from("cart")
      .select("cart_id")
      .eq("customer_id", customerId)
      .single();

    if (error || !data) return null;
    return data.cart_id;
  }

  /**
   * Xóa cart items
   */
  async deleteCartItems(
    cartId: number,
    productItemIds: number[]
  ): Promise<void> {
    const { error } = await supabase
      .from("cartitems")
      .delete()
      .eq("cart_id", cartId)
      .in("product_item_id", productItemIds);

    if (error) {
      console.error("Error deleting checked out cart items:", error);
      throw error;
    }
  }
}

