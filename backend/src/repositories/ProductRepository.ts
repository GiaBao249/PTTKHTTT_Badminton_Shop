import { injectable } from "tsyringe";
import { Product, ProductItem, UpdateProductDto } from "../models/Product";
import { supabase } from "../config/supabase";

@injectable()
export class ProductRepository {
  async findAll(): Promise<Product[]> {
    const { data, error } = await supabase
      .from("product")
      .select(
        "product_id, supplier_id , category_id , product_name, price, price_purchase , description, warranty_period"
      )
      .or("is_deleted.is.null, is_deleted.eq.false")
      .order("product_id", { ascending: false });
    if (error) throw error;
    return data ?? [];
  }
  async findById(productId: number): Promise<Product | null> {
    const { data, error } = await supabase
      .from("product")
      .select("*")
      .eq("product_id", productId)
      .or("is_deleted.is.null, is_deleted.eq.false")
      .single();
    if (error) throw error;
    return data;
  }
  async getProductItemsWithImages(
    productIds: number[]
  ): Promise<Map<number, string>> {
    if (productIds.length === 0) return new Map();
    const { data, error } = await supabase
      .from("product_item")
      .select(
        `
            product_id, product_image (
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
  async create(productData: Partial<Product>): Promise<Product> {
    const { data, error } = await supabase
      .from("product")
      .insert([productData])
      .select()
      .single();
    if (error) throw error;
    if (!data || !data.product_id) {
      throw new Error("Không thể tạo sản phẩm: Không nhận được product_id");
    }
    return data;
  }
  async createProductItem(productId: number): Promise<ProductItem> {
    const { data, error } = await supabase
      .from("product_item")
      .insert([{ product_id: productId, quantity: 0 }])
      .select()
      .single();

    if (error) throw error;
    if (!data || !data.product_item_id) {
      throw new Error(
        "Không thể tạo product_item: Không nhận được product_item_id"
      );
    }
    return data;
  }
  async createProductConfigurations(
    productItemId: number,
    variationOptionIds: number[]
  ): Promise<void> {
    if (variationOptionIds.length === 0) return;

    const configurations = variationOptionIds.map((optionId) => ({
      product_item_id: productItemId,
      variation_option_id: optionId,
    }));

    const { error } = await supabase
      .from("product_configuration")
      .insert(configurations);

    if (error) throw error;
  }
  async update(
    productId: number,
    updateData: UpdateProductDto
  ): Promise<Product> {
    const { data, error } = await supabase
      .from("product")
      .update(updateData)
      .eq("product_id", productId)
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      throw new Error("Không tìm thấy sản phẩm sau khi cập nhật");
    }
    return data;
  }
  async softDelete(productId: number): Promise<void> {
    const { error } = await supabase
      .from("product")
      .update({ is_deleted: true })
      .eq("product_id", productId);

    if (error) throw error;
  }
  async findAllProductItems(): Promise<ProductItem[]> {
    const { data, error } = await supabase.from("product_item").select("*");

    if (error) throw error;
    return data ?? [];
  }
}
