import { Request, Response, Router } from "express";
import { supabase } from "../../config/supabase";

export function registerCreateProduct(router: Router) {
  router.post("/createProducts", async (req: Request, res: Response) => {
    try {
      const { product_name, category_id, description, warranty_period } =
        req.body;

      if (!product_name || !category_id) {
        return res.status(400).json({ error: "Thiếu thông tin sản phẩm" });
      }

      const { data: newProduct, error } = await supabase
        .from("product")
        .insert([
          {
            product_name,
            category_id,
            description: description || "",
            warranty_period: warranty_period || 0,
            price: 0,
            supplier_id: null,
          },
        ])
        .select();

      if (error) {
        throw error;
      }

      res.status(201).json(newProduct[0]);
    } catch (error: any) {
      console.error("Lỗi khi tạo sản phẩm:", error);
      return res.status(500).json({
        error: error.message || "Lỗi server khi tạo sản phẩm",
      });
    }
  });
}
