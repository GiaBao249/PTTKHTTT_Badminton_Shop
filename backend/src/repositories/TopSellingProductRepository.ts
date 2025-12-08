import { injectable } from "tsyringe";
import { supabase } from "../config/supabase";

@injectable()
export class TopSellingProductRepository {
  async getOrderDetails(): Promise<
    Array<{ product_item_id: number; quantity: number }>
  > {
    const { data, error } = await supabase
      .from("orderdetail")
      .select("product_item_id , quantity");
    if (error) {
      throw error;
    }
    return data ?? [];
  }
  async getProductItemsByIds(
    productItemsIds: number[]
  ): Promise<Array<{ product_item_id: number; product_id: number }>> {
    if (productItemsIds.length === 0) return [];
    const { data, error } = await supabase
      .from("product_item")
      .select("product_item_id, product_id")
      .in("product_item_id", productItemsIds);
    if (error) throw error;
    return data ?? [];
  }
  async getProductsWithImages(productIds: number[]): Promise<any[]> {
    if (productIds.length === 0) return [];
    const { data, error } = await supabase
      .from("product")
      .select(
        `product_id, product_name, price, 
        product_item!inner(
        product_id, product_image(
        image_filename
        ))`
      )
      .in("product_id", productIds)
      .or("is_deleted.is.null,is_deleted.eq.false");
    if (error) throw error;
    return data ?? [];
  }
}
