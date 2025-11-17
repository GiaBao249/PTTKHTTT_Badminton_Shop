import { Request, Response, Router } from "express";
import { supabase } from "../../config/supabase";

export function registerSearchRoutes(router: Router) {
  router.get("/search/:keyword", async (req: Request, res: Response) => {
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
        .order("product_id", { ascending: false });

      if (error) throw error;
      const products = data ?? [];
      if (products.length === 0) return res.json([]);

      const productIds = products.map((p: any) => p.product_id);
      const { data: items, error: itemsError } = await supabase
        .from("product_item")
        .select("product_id, quantity")
        .in("product_id", productIds);
      if (itemsError) throw itemsError;

      const idToTotalQty = new Map<number, number>();
      (items ?? []).forEach((it: any) => {
        const prev = idToTotalQty.get(it.product_id) ?? 0;
        idToTotalQty.set(it.product_id, prev + (it.quantity ?? 0));
      });

      const withInventory = products.map((p: any) => ({
        ...p,
        total_quantity: idToTotalQty.get(p.product_id) ?? 0,
      }));

      res.json(withInventory);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
}
