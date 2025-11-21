import { Request, Response, Router } from "express";
import { supabase } from "../../config/supabase";

export function registerFeaturedRoutes(router: Router) {
  router.get("/featured-products", async (req: Request, res: Response) => {
    try {
      const { data, error } = await supabase
        .from("product")
        .select(
          `
          product_id,
          product_name,
          price,
          description,
          warranty_period,
          category:category_id (
            category_id,
            category_name
          )
        `
        )
        .or("is_deleted.is.null,is_deleted.eq.false")
        .order("product_id", { ascending: false })
        .limit(4);
      if (error) throw error;
      const productList = data ?? [];
      if (productList.length === 0) return res.json([]);
      const productIds = productList.map((p: any) => p.product_id);
      const { data: items, error: itemsError } = await supabase
        .from("product_item")
        .select(
          `
          product_item_id,
          product_id,
          quantity,
          product_image (
            image_filename
          )
        `
        )
        .in("product_id", productIds);
      if (itemsError) throw itemsError;
      const productItemList = items ?? [];
      const idToTotalQty = new Map<number, number>();
      const idToThumbnail = new Map<number, string>();
      (productItemList ?? []).forEach((it: any) => {
        const prev = idToTotalQty.get(it.product_id) ?? 0;
        idToTotalQty.set(it.product_id, prev + (it.quantity ?? 0));
        const firstImage = it.product_image?.[0]?.image_filename;
        if (it.product_id && firstImage && !idToThumbnail.has(it.product_id)) {
          idToThumbnail.set(it.product_id, firstImage);
        }
      });
      const withInventory = productList.map((p: any) => ({
        ...p,
        total_quantity: idToTotalQty.get(p.product_id) ?? 0,
        thumbnail: idToThumbnail.get(p.product_id) ?? null,
      }));
      res.json(withInventory);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
}
