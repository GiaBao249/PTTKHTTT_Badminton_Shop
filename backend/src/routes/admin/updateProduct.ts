import { Request, Response, Router } from "express";
import { supabase } from "../../config/supabase";

export function registerUpdateProduct(router: Router) {
  router.put("/updateProduct/:id", async (req: Request, res: Response) => {
    try {
      const productId = parseInt(req.params.id);
      const { product_name, category_id, price } = req.body;

      if (isNaN(productId)) {
        return res.status(400).json({ error: "Invalid product ID" });
      }

      if (!product_name || !category_id || !price) {
        return res.status(400).json({
          error: "Thiếu thông tin sản phẩm (tên, danh mục, giá)",
        });
      }

      if (price <= 0) {
        return res.status(400).json({ error: "Giá phải lớn hơn 0" });
      }

      const { data: existingProduct, error: checkError } = await supabase
        .from("product")
        .select("product_id")
        .eq("product_id", productId)
        .single();

      if (checkError || !existingProduct) {
        return res.status(404).json({ error: "Không tìm thấy sản phẩm" });
      }

      const { data: updatedProduct, error: updateError } = await supabase
        .from("product")
        .update({
          product_name,
          category_id,
          price,
        })
        .eq("product_id", productId)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      res.json({
        success: true,
        product: updatedProduct,
        message: "Cập nhật sản phẩm thành công",
      });
    } catch (error: any) {
      console.error("Lỗi khi cập nhật sản phẩm:", error);
      return res.status(500).json({
        error: error.message || "Lỗi server khi cập nhật sản phẩm",
      });
    }
  });
}
