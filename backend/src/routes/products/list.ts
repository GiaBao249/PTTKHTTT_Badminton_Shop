import { Request, response, Response, Router } from "express";
import { supabase } from "../../config/supabase";

export function registerListRoutes(router: Router) {
  router.get("/", async (req: Request, res: Response) => {
    try {
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
  router.get("/category/:categoryId", async (req: Request, res: Response) => {
    try {
      const { categoryId } = req.params;

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
        .eq("category_id", categoryId)
        .order("product_id", { ascending: false });

      if (error) throw error;
      const product = data ?? [];
      if (product.length === 0) return res.json([]);

      const productIds = product.map((p: any) => p.product_id);
      console.log(productIds);
      const { data: items, error: itemsError } = await supabase
        .from("product_item")
        .select(
          `
          product_id , 
          quantity
        `
        )
        .in("product_id", productIds);
      if (itemsError) throw itemsError;
      const idToTotalQty = new Map<number, number>();
      (items ?? []).forEach((it: any) => {
        const prev = idToTotalQty.get(it.product_id) ?? 0;
        idToTotalQty.set(it.product_id, prev + (it.quantity ?? 0));
      });
      const withInventory = product.map((p: any) => ({
        ...p,
        total_quantity: idToTotalQty.get(p.product_id) ?? 0,
      }));
      res.json(withInventory);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
}
