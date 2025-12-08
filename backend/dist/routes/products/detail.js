"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerDetailRoutes = registerDetailRoutes;
const supabase_1 = require("../../config/supabase");
function registerDetailRoutes(router) {
    router.get("/:id", async (req, res) => {
        try {
            const productId = req.params.id;
            const { data: product, error: productError } = await supabase_1.supabase
                .from("product")
                .select(`
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
      `)
                .eq("product_id", productId)
                .or("is_deleted.is.null,is_deleted.eq.false")
                .single();
            if (productError)
                throw productError;
            if (!product) {
                res.status(404).json({ error: "Product not found" });
                return;
            }
            const { data: items, error: itemsError } = await supabase_1.supabase
                .from("product_item")
                .select(`
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
      `)
                .eq("product_id", productId);
            if (itemsError)
                throw itemsError;
            const normalizedItems = (items ?? []).map((it) => ({
                product_item_id: it.product_item_id,
                product_id: it.product_id,
                quantity: it.quantity,
                images: (it.product_image ?? []).map((img) => {
                    // Get public URL from Supabase Storage
                    const { data: { publicUrl }, } = supabase_1.supabase.storage
                        .from("product-images")
                        .getPublicUrl(img.image_filename);
                    return {
                        image_id: img.image_id,
                        image_filename: img.image_filename,
                        image_url: publicUrl,
                    };
                }),
                attributes: (it.product_configuration ?? []).map((cfg) => ({
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
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
}
//# sourceMappingURL=detail.js.map