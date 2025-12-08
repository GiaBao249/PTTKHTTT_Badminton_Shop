import { injectable } from "tsyringe";
import { supabase } from "../config/supabase";
import { CartItem } from "../models/Cart";

@injectable()
export class CartRepository {
  /**
   * Lấy cart ID của customer
   */
  async getCartIdByCustomerId(customerId: number): Promise<number | null> {
    const { data, error } = await supabase
      .from("cart")
      .select("cart_id")
      .eq("customer_id", customerId)
      .single();

    if (error || !data) return null;
    return data.cart_id;
  }

  /**
   * Tạo cart mới
   */
  async createCart(customerId: number): Promise<number> {
    const { data, error } = await supabase
      .from("cart")
      .insert({ customer_id: customerId })
      .select("cart_id")
      .single();

    if (error) throw error;
    if (!data) throw new Error("Không thể tạo cart");
    return data.cart_id;
  }

  /**
   * Lấy cart items với product info
   */
  async getCartItems(cartId: number): Promise<CartItem[]> {
    const { data, error } = await supabase
      .from("cartitems")
      .select(
        `
        quantity,
        total_amount,
        product_item:product_item_id(
          product_item_id,
          product_id,
          quantity,
          product:product_id(
            product_id,
            product_name,
            price,
            is_deleted,
            category:category_id(
              category_id,
              category_name
            )
          )
        )
      `
      )
      .eq("cart_id", cartId);

    if (error) throw error;
    return (data ?? []).filter((item: any) => {
      const product = item.product_item?.product;
      return product && (product.is_deleted === false || product.is_deleted === null);
    });
  }

  /**
   * Lấy product items với images để lấy thumbnails
   */
  async getProductItemsWithImages(
    productIds: number[]
  ): Promise<Map<number, string>> {
    if (productIds.length === 0) return new Map();

    const { data, error } = await supabase
      .from("product_item")
      .select(
        `
        product_id,
        product_image(
          image_filename
        )
      `
      )
      .in("product_id", productIds);

    if (error) throw error;

    const thumbnailMap = new Map<number, string>();
    (data ?? []).forEach((item: any) => {
      const firstImage = item.product_image?.[0]?.image_filename;
      if (item.product_id && firstImage && !thumbnailMap.has(item.product_id)) {
        const {
          data: { publicUrl },
        } = supabase.storage.from("product-images").getPublicUrl(firstImage);
        thumbnailMap.set(item.product_id, publicUrl);
      }
    });

    return thumbnailMap;
  }

  /**
   * Lấy product item theo ID
   */
  async getProductItemById(
    productItemId: number
  ): Promise<{ product_id: number; quantity: number } | null> {
    const { data, error } = await supabase
      .from("product_item")
      .select("product_id, product_item_id, quantity")
      .eq("product_item_id", productItemId)
      .single();

    if (error || !data) return null;
    return { product_id: data.product_id, quantity: data.quantity };
  }

  /**
   * Lấy product price
   */
  async getProductPrice(productId: number): Promise<number | null> {
    const { data, error } = await supabase
      .from("product")
      .select("price")
      .eq("product_id", productId)
      .or("is_deleted.is.null,is_deleted.eq.false")
      .single();

    if (error || !data) return null;
    return data.price;
  }

  /**
   * Lấy cart item hiện có
   */
  async getExistingCartItem(
    cartId: number,
    productItemId: number
  ): Promise<any | null> {
    const { data, error } = await supabase
      .from("cartitems")
      .select("*")
      .eq("cart_id", cartId)
      .eq("product_item_id", productItemId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  /**
   * Thêm cart item
   */
  async addCartItem(
    cartId: number,
    productItemId: number,
    quantity: number,
    totalAmount: number
  ): Promise<any> {
    const { data, error } = await supabase
      .from("cartitems")
      .insert({
        cart_id: cartId,
        product_item_id: productItemId,
        quantity: quantity,
        total_amount: totalAmount,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Cập nhật cart item
   */
  async updateCartItem(
    cartId: number,
    productItemId: number,
    quantity: number,
    totalAmount: number
  ): Promise<any> {
    const { data, error } = await supabase
      .from("cartitems")
      .update({
        quantity: quantity,
        total_amount: totalAmount,
      })
      .eq("cart_id", cartId)
      .eq("product_item_id", productItemId)
      .select();

    if (error) throw error;
    return data?.[0];
  }

  /**
   * Xóa cart item
   */
  async deleteCartItem(cartId: number, productItemId: number): Promise<void> {
    const { error } = await supabase
      .from("cartitems")
      .delete()
      .eq("cart_id", cartId)
      .eq("product_item_id", productItemId);

    if (error) throw error;
  }
}

