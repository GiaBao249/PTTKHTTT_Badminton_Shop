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
        .order("product_id", { ascending: false })
        .limit(4);
      if (error) throw error;
      const productList = data ?? [];
      if (productList.length === 0) return res.json([]);
      const productIds = productList.map((p: any) => p.product_id);
      const { data: items, error: itemsError } = await supabase
        .from("product_item")
        .select("product_item_id, product_id, quantity")
        .in("product_id", productIds);
      if (itemsError) throw itemsError;
      const productItemList = items ?? [];
      const idToTotalQty = new Map<number, number>();
      (productItemList ?? []).forEach((it: any) => {
        const prev = idToTotalQty.get(it.product_id) ?? 0;
        idToTotalQty.set(it.product_id, prev + (it.quantity ?? 0));
      });
      const withInventory = productList.map((p: any) => ({
        ...p,
        total_quantity: idToTotalQty.get(p.product_id) ?? 0,
      }));
      res.json(withInventory);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
}
