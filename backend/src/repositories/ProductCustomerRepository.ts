import { injectable } from "tsyringe";
import { supabase } from "../config/supabase";
import { ProductCustomer, ProductDetail, Variation, FilterDto } from "../models/ProductCustomer";

@injectable()
export class ProductCustomerRepository {
  /**
   * Lấy tất cả products (không deleted)
   */
  async findAll(): Promise<any[]> {
    const { data, error } = await supabase
      .from("product")
      .select(
        `
        product_id,
        supplier_id,
        category_id,
        product_name,
        price,
        description,
        warranty_period,
        category:category_id(
          category_id,
          category_name
        )
      `
      )
      .or("is_deleted.is.null,is_deleted.eq.false")
      .order("product_id", { ascending: false });

    if (error) throw error;
    return data ?? [];
  }

  /**
   * Lấy products theo category
   */
  async findByCategory(categoryId: number): Promise<any[]> {
    const { data, error } = await supabase
      .from("product")
      .select(
        `
        product_id,
        supplier_id,
        category_id,
        product_name,
        price,
        description,
        warranty_period,
        category:category_id(
          category_id,
          category_name
        )
      `
      )
      .eq("category_id", categoryId)
      .or("is_deleted.is.null,is_deleted.eq.false")
      .order("product_id", { ascending: false });

    if (error) throw error;
    return data ?? [];
  }

  /**
   * Search products
   */
  async search(keyword: string): Promise<any[]> {
    const { data, error } = await supabase
      .from("product")
      .select(
        `
        product_id,
        supplier_id,
        category_id,
        product_name,
        price,
        description,
        warranty_period,
        category:category_id(
          category_id,
          category_name
        )
      `
      )
      .or(`product_name.ilike.%${keyword}%,description.ilike.%${keyword}%`)
      .or("is_deleted.is.null,is_deleted.eq.false")
      .order("product_id", { ascending: false });

    if (error) throw error;
    return data ?? [];
  }

  /**
   * Filter products
   */
  async filter(filterDto: FilterDto): Promise<any[]> {
    let baseQuery = supabase
      .from("product")
      .select(
        `
        product_id,
        supplier_id,
        category_id,
        product_name,
        price,
        description,
        warranty_period,
        category:category_id(
          category_id,
          category_name
        )
      `
      )
      .or("is_deleted.is.null,is_deleted.eq.false")
      .order("product_id", { ascending: false });

    if (filterDto.categoryId) {
      baseQuery = baseQuery.eq("category_id", filterDto.categoryId);
    }

    const { data, error } = await baseQuery;
    if (error) throw error;
    return data ?? [];
  }

  /**
   * Lấy featured products (limit 4)
   */
  async findFeatured(limit: number = 4): Promise<any[]> {
    const { data, error } = await supabase
      .from("product")
      .select(
        `
        product_id,
        product_name,
        price,
        description,
        warranty_period,
        category:category_id(
          category_id,
          category_name
        )
      `
      )
      .or("is_deleted.is.null,is_deleted.eq.false")
      .order("product_id", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data ?? [];
  }

  /**
   * Lấy product detail theo ID
   */
  async findDetailById(productId: number): Promise<any | null> {
    const { data, error } = await supabase
      .from("product")
      .select(
        `
        product_id,
        supplier_id,
        category_id,
        product_name,
        price,
        description,
        warranty_period,
        category:category_id(
          category_id,
          category_name
        )
      `
      )
      .eq("product_id", productId)
      .or("is_deleted.is.null,is_deleted.eq.false")
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Lấy product items với images và configurations
   */
  async getProductItemsWithDetails(productId: number): Promise<any[]> {
    const { data, error } = await supabase
      .from("product_item")
      .select(
        `
        product_item_id,
        product_id,
        quantity,
        product_image(
          image_id,
          image_filename
        ),
        product_configuration(
          variation_option_id,
          variation_options(
            variation_option_id,
            value,
            variation(
              variation_id,
              name
            )
          )
        )
      `
      )
      .eq("product_id", productId);

    if (error) throw error;
    return data ?? [];
  }

  /**
   * Lấy product items với quantity và images
   */
  async getProductItemsWithQuantityAndImages(
    productIds: number[]
  ): Promise<{
    quantityMap: Map<number, number>;
    thumbnailMap: Map<number, string>;
  }> {
    if (productIds.length === 0) {
      return { quantityMap: new Map(), thumbnailMap: new Map() };
    }

    const { data, error } = await supabase
      .from("product_item")
      .select(
        `
        product_id,
        quantity,
        product_image(
          image_filename
        )
      `
      )
      .in("product_id", productIds);

    if (error) throw error;

    const quantityMap = new Map<number, number>();
    const thumbnailMap = new Map<number, string>();

    (data ?? []).forEach((it: any) => {
      const prev = quantityMap.get(it.product_id) ?? 0;
      quantityMap.set(it.product_id, prev + (it.quantity ?? 0));

      const firstImage = it.product_image?.[0]?.image_filename;
      if (it.product_id && firstImage && !thumbnailMap.has(it.product_id)) {
        const {
          data: { publicUrl },
        } = supabase.storage.from("product-images").getPublicUrl(firstImage);
        thumbnailMap.set(it.product_id, publicUrl);
      }
    });

    return { quantityMap, thumbnailMap };
  }

  /**
   * Lấy variations theo category
   */
  async getVariationsByCategory(categoryId: number): Promise<Variation[]> {
    const { data, error } = await supabase
      .from("variation")
      .select(
        `
        variation_id,
        name,
        variation_options(
          variation_option_id,
          value
        )
      `
      )
      .eq("category_id", categoryId)
      .order("variation_id", { ascending: true });

    if (error) throw error;
    return data ?? [];
  }

  /**
   * Đếm products
   */
  async count(categoryId?: number): Promise<number> {
    let query = supabase
      .from("product")
      .select("*", { count: "exact", head: true })
      .or("is_deleted.is.null,is_deleted.eq.false");

    if (categoryId && categoryId > 0) {
      query = query.eq("category_id", categoryId);
    }

    const { count, error } = await query;
    if (error) throw error;
    return count ?? 0;
  }

  /**
   * Lấy top products by category với sold quantity
   */
  async getTopByCategories(categoryIds: number[]): Promise<any[]> {
    const { data, error } = await supabase
      .from("product")
      .select(
        `
        product_id,
        supplier_id,
        category_id,
        product_name,
        price,
        description,
        warranty_period,
        category:category_id(
          category_id,
          category_name
        )
      `
      )
      .in("category_id", categoryIds)
      .or("is_deleted.is.null,is_deleted.eq.false");

    if (error) throw error;
    return data ?? [];
  }

  /**
   * Lấy product items với images cho top products
   */
  async getProductItemsForTop(
    productIds: number[]
  ): Promise<{
    items: any[];
    thumbnailMap: Map<number, string>;
    inventoryMap: Map<number, number>;
  }> {
    if (productIds.length === 0) {
      return {
        items: [],
        thumbnailMap: new Map(),
        inventoryMap: new Map(),
      };
    }

    const { data, error } = await supabase
      .from("product_item")
      .select(
        `
        product_item_id,
        product_id,
        quantity,
        product_image(
          image_filename
        )
      `
      )
      .in("product_id", productIds);

    if (error) throw error;

    const items = data ?? [];
    const thumbnailMap = new Map<number, string>();
    const inventoryMap = new Map<number, number>();

    items.forEach((it: any) => {
      const prev = inventoryMap.get(it.product_id) ?? 0;
      inventoryMap.set(it.product_id, prev + (it.quantity ?? 0));

      const firstImage = it.product_image?.[0]?.image_filename;
      if (it.product_id && firstImage && !thumbnailMap.has(it.product_id)) {
        const {
          data: { publicUrl },
        } = supabase.storage.from("product-images").getPublicUrl(firstImage);
        thumbnailMap.set(it.product_id, publicUrl);
      }
    });

    return { items, thumbnailMap, inventoryMap };
  }

  /**
   * Lấy order details để tính sold quantity
   */
  async getOrderDetailsByProductItemIds(
    productItemIds: number[]
  ): Promise<Array<{ product_item_id: number; quantity: number }>> {
    if (productItemIds.length === 0) return [];

    const { data, error } = await supabase
      .from("orderdetail")
      .select("product_item_id, quantity")
      .in("product_item_id", productItemIds);

    if (error) throw error;
    return data ?? [];
  }

  /**
   * Lấy product items với configurations để filter
   */
  async getProductItemsWithConfigurations(
    productIds: number[]
  ): Promise<any[]> {
    if (productIds.length === 0) return [];

    const { data, error } = await supabase
      .from("product_item")
      .select(
        `
        product_item_id,
        product_id,
        quantity,
        product_configuration(
          variation_option_id
        )
      `
      )
      .in("product_id", productIds);

    if (error) throw error;
    return data ?? [];
  }

  /**
   * Lấy specification của product
   */
  async getProductSpecification(productId: number): Promise<
    Array<{ name: string; value: string }>
  > {
    const { data, error } = await supabase
      .from("product_item")
      .select(
        `
        product_item_id,
        product_id,
        product_configuration(
          variation_option_id,
          variation_options(
            variation_option_id,
            value,
            variation(
              variation_id,
              name
            )
          )
        )
      `
      )
      .eq("product_id", productId);

    if (error) throw error;
    if (!data || data.length === 0) return [];

    const specs: { name: string; value: string }[] = [];
    const seen = new Set<string>();

    data.forEach((item: any) => {
      const configs = item.product_configuration ?? [];
      configs.forEach((cfg: any) => {
        const varOpt = cfg.variation_options;
        if (!varOpt || !varOpt.variation) return;

        const key = `${varOpt.variation.name}:${varOpt.value}`;
        if (!seen.has(key)) {
          seen.add(key);
          specs.push({
            name: varOpt.variation.name,
            value: varOpt.value,
          });
        }
      });
    });

    return specs;
  }
}

