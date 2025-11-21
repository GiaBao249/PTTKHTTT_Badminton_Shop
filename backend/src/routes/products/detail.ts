import { Request, Response, Router } from "express";
import { supabase } from "../../config/supabase";

export function registerDetailRoutes(router: Router) {
  router.get("/:id", async (req: Request, res: Response) => {
    try {
      const productId = req.params.id;

      const { data: product, error: productError } = await supabase
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
        .eq("product_id", productId)
        .or("is_deleted.is.null,is_deleted.eq.false")
        .single();
      if (productError) throw productError;
      if (!product) return res.status(404).json({ error: "Product not found" });

      const { data: items, error: itemsError } = await supabase
        .from("product_item")
        .select(
          `
        product_item_id,
        product_id,
        quantity,
        product_image (
          image_id,
          image_filename
        ),
        product_configuration (
          variation_option_id,
          variation_options (
            variation_option_id,
            value,
            variation (
              variation_id,
              name
            )
          )
        )
      `
        )
        .eq("product_id", productId);
      if (itemsError) throw itemsError;

      const normalizedItems =
        (items ?? []).map((it: any) => ({
          product_item_id: it.product_item_id,
          product_id: it.product_id,
          quantity: it.quantity,
          images: (it.product_image ?? []).map((img: any) => ({
            image_id: img.image_id,
            image_filename: img.image_filename,
          })),
          attributes: (it.product_configuration ?? []).map((cfg: any) => ({
            variation_option_id: cfg.variation_option_id,
            value: cfg.variation_options?.value,
            variation: cfg.variation_options?.variation
              ? {
                  variation_id: cfg.variation_options.variation.variation_id,
                  name: cfg.variation_options.variation.name,
                }
              : null,
          })),
        })) ?? [];

      res.json({
        ...product,
        items: normalizedItems,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
}
