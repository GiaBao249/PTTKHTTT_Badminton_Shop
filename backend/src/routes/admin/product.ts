import { Request, Response, Router } from "express";
import { supabase } from "../../config/supabase";
import { debugPort } from "process";

export function registerProductAdmin(router: Router) {
  // get san pham ve
  // co cate , gia , stock , ten san pham , id
  router.get("/products", async (req: Request, res: Response) => {
    try {
      const { data, error } = await supabase.from("product")
        .select(`product_id , product_name , price , category_id , category:category_id(
            category_id, 
            category_name
          )`);
      if (error) {
        throw error;
      }

      const products = data ?? [];
      if (products.length === 0) return res.json([]);
      const productsId = products.map((id) => id.product_id);
      const { data: items, error: itemsError } = await supabase
        .from("product_item")
        .select(`product_id , quantity`)
        .in("product_id", productsId);
      if (itemsError) throw itemsError;
      const idToTotalQty = new Map<number, number>();
      (items ?? []).forEach((it: any) => {
        const prev = idToTotalQty.get(it.product_id) ?? 0;
        idToTotalQty.set(it.product_id, prev + (it.quantity ?? 0));
      });
      const reloadProducts = products.map((p: any) => ({
        ...p,
        inStock: idToTotalQty.get(p.product_id) ?? 0,
      }));
      res.json(reloadProducts);
    } catch (error) {
      return res.status(500).json({ error: "Lỗi server" });
    }
  });
}
