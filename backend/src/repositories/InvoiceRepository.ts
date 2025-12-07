import { inject, injectable } from "tsyringe";
import { GetInvoicesQuery } from "../services/Invoice";
import { supabase } from "../config/supabase";
import { fileURLToPath } from "url";

@injectable()
export class InvoiceRepository {
  async findOrdersWithFilter(filter: GetInvoicesQuery): Promise<any[]> {
    let query = supabase
      .from("orders")
      .select(
        "order_id, customer_id, status, total_amount, order_date, delivery_date, address_id"
      )
      .order("order_date", { ascending: false });
    if (filter.startDate && typeof filter.startDate === "string") {
      query = query.gte("order_date", filter.startDate);
    }
    if (filter.endDate && typeof filter.endDate === "string") {
      const endDateTime = new Date(filter.endDate);
      endDateTime.setHours(23, 59, 59, 999);
      query = query.lte("order_date", endDateTime.toISOString());
    }
    if (
      filter.status &&
      typeof filter.status === "string" &&
      filter.status !== "all"
    ) {
      const normalizedStatus =
        filter.status.charAt(0).toUpperCase() +
        filter.status.slice(1).toLowerCase();
      query = query.eq("status", normalizedStatus);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
  }
  async findOrderById(orderId: number): Promise<any | null> {
    const { data, error } = await supabase
      .from("orders")
      .select(
        "order_id, customer_id, total_amount,order_date , deliver_date,address_id"
      )
      .eq("order_id", orderId)
      .single();
    if (error) throw error;
    return data;
  }
  async getCustomerByIds(customerIds: number[]): Promise<Map<number, any>> {
    if (customerIds.length === 0) return new Map();
    const { data, error } = await supabase
      .from("customer")
      .select("customer_id,customer_name,customer_phone,customer_email")
      .in("customer_id", customerIds);
    if (error) throw error;
    const customerMap = new Map<number, any>();
    (data ?? []).forEach((c: any) => {
      customerMap.set(c.customer_id, c);
    });
    return customerMap;
  }
  async getOrderDetailsByOrderIds(orderIds: number[]): Promise<any[]> {
    if (orderIds.length === 0) return [];
    const { data, error } = await supabase
      .from("orderdetail")
      .select("order_id, product_item_id, quantity, amount")
      .in("order_id", orderIds);
    if (error) throw error;
    return data ?? [];
  }
  async getProductsWithCategoriesAndImages(
    productIds: number[]
  ): Promise<Map<number, any>> {
    if (productIds.length === 0) return new Map();

    const { data, error } = await supabase
      .from("product")
      .select(
        `
        product_id,
        product_name,
        price,
        category_id,
        category:category_id (
          category_id,
          category_name
        ),
        product_item!inner (
          product_id,
          product_image (
            image_filename
          )
        )
      `
      )
      .in("product_id", productIds);

    if (error) throw error;

    const productMap = new Map<number, any>();
    (data ?? []).forEach((p: any) => {
      const firstItem = p.product_item?.[0];
      const firstImage = firstItem?.product_image?.[0]?.image_filename;
      p.thumbnail = firstImage || null;
      productMap.set(p.product_id, p);
    });

    return productMap;
  }

  async getProductItemsByIds(
    productItemIds: number[]
  ): Promise<Map<number, any>> {
    if (productItemIds.length === 0) return new Map();

    const { data, error } = await supabase
      .from("product_item")
      .select("product_item_id, product_id")
      .in("product_item_id", productItemIds);

    if (error) throw error;

    const productItemMap = new Map<number, any>();
    (data ?? []).forEach((pi: any) => {
      productItemMap.set(pi.product_item_id, pi);
    });
    return productItemMap;
  }
}
