import { Request, Response, Router } from "express";
import { supabase } from "../../config/supabase";

export function registerSearchRoutes(router: Router) {
  router.get(
    "/search/:keyword",
    async (req: Request, res: Response): Promise<void> => {
      try {
        const { keyword } = req.params;

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
        category:category_id (
          category_id,
          category_name
        )
      `
          )
          .or(`product_name.ilike.%${keyword}%,description.ilike.%${keyword}%`)
          .or("is_deleted.is.null,is_deleted.eq.false")
          .order("product_id", { ascending: false });

        if (error) throw error;
        const products = data ?? [];
        if (products.length === 0) {
          res.json([]);
          return;
        }

        const productIds = products.map((p: any) => p.product_id);
        const { data: items, error: itemsError } = await supabase
          .from("product_item")
          .select(
            `
          product_id,
          quantity,
          product_image (
            image_filename
          )
        `
          )
          .in("product_id", productIds);
        if (itemsError) throw itemsError;

        const idToTotalQty = new Map<number, number>();
        const idToThumbnail = new Map<number, string>();
        (items ?? []).forEach((it: any) => {
          const prev = idToTotalQty.get(it.product_id) ?? 0;
          idToTotalQty.set(it.product_id, prev + (it.quantity ?? 0));
          const firstImage = it.product_image?.[0]?.image_filename;
          if (
            it.product_id &&
            firstImage &&
            !idToThumbnail.has(it.product_id)
          ) {
            // Get public URL from Supabase Storage
            const {
              data: { publicUrl },
            } = supabase.storage
              .from("product-images")
              .getPublicUrl(firstImage);
            idToThumbnail.set(it.product_id, publicUrl);
          }
        });

        const withInventory = products.map((p: any) => ({
          ...p,
          total_quantity: idToTotalQty.get(p.product_id) ?? 0,
          thumbnail: idToThumbnail.get(p.product_id) ?? null,
        }));

        res.json(withInventory);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );
}
