import { Request, Response, Router } from "express";
import { supabase } from "../../config/supabase";

export function registerDeleteProduct(router: Router) {
  router.delete("/deleteProduct/:id", async (req: Request, res: Response) => {
    try {
      const productId = parseInt(req.params.id || "0");

      if (isNaN(productId)) {
        return res.status(400).json({ error: "Invalid product ID" });
      }

      const { data: existingProduct, error: checkError } = await supabase
        .from("product")
        .select("product_id, is_deleted")
        .eq("product_id", productId)
        .single();

      if (checkError || !existingProduct) {
        return res.status(404).json({ error: "Không tìm thấy sản phẩm" });
      }

      if (existingProduct.is_deleted === true) {
        return res.status(400).json({ error: "Sản phẩm đã bị xóa" });
      }

      const { data: updatedProduct, error: updateError } = await supabase
        .from("product")
        .update({ is_deleted: true })
        .eq("product_id", productId)
        .select()
        .single();

      if (!updatedProduct) {
        return res.status(404).json({ error: "Không tìm thấy sản phẩm" });
      }

      res.json({
        success: true,
        message: "Xóa sản phẩm thành công",
      });
    } catch (error: any) {
      console.error("Delete product error:", error);
      return res.status(500).json({
        error: error.message || "Không thể xóa sản phẩm",
      });
    }
  });
}
