import { Request, Response, Router } from "express";
import { supabase } from "../../config/supabase";

export function registerGetProduct(router: Router) {
  router.get("/getProducts", async (req: Request, res: Response) => {
    try {
      const { data: products, error } = await supabase
        .from("product")
        .select(
          "product_id, supplier_id, category_id, product_name, price, price_purchase, description, warranty_period"
        )
        .or("is_deleted.is.null,is_deleted.eq.false")
        .order("product_id", { ascending: false });

      if (error) {
        throw error;
      }

      if (!products || products.length === 0) {
        return res.json([]);
      }

      const productIds = products.map((p) => p.product_id);

      const { data: productItems, error: itemsError } = await supabase
        .from("product_item")
        .select(
          `
            product_id,
            product_image (
              image_filename
            )
          `
        )
        .in("product_id", productIds);

      if (itemsError) {
        throw itemsError;
      }

      const thumbnailMap = new Map<number, string>();
      (productItems ?? []).forEach((item) => {
        const firstImage = item.product_image?.[0]?.image_filename;
        if (item.product_id && firstImage && !thumbnailMap.has(item.product_id)) {
          thumbnailMap.set(item.product_id, firstImage);
        }
      });

      const enrichedProducts = products.map((product) => ({
        ...product,
        thumbnail: thumbnailMap.get(product.product_id) ?? null,
      }));

      return res.json(enrichedProducts);
    } catch (error) {
      console.error("Lỗi khi lấy sản phẩm:", error);
      return res.status(500).json({
        error: "Lỗi server khi lấy sản phẩm",
      });
    }
  });
}
