"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerFeaturedRoutes = registerFeaturedRoutes;
const supabase_1 = require("../../config/supabase");
function registerFeaturedRoutes(router) {
    router.get("/featured-products", async (req, res) => {
        try {
            const { data, error } = await supabase_1.supabase
                .from("product")
                .select(`
          product_id,
          product_name,
          price,
          description,
          warranty_period,
          category:category_id (
            category_id,
            category_name
          )
        `)
                .or("is_deleted.is.null,is_deleted.eq.false")
                .order("product_id", { ascending: false })
                .limit(4);
            if (error)
                throw error;
            const productList = data ?? [];
            if (productList.length === 0) {
                res.json([]);
                return;
            }
            const productIds = productList.map((p) => p.product_id);
            const { data: items, error: itemsError } = await supabase_1.supabase
                .from("product_item")
                .select(`
          product_item_id,
          product_id,
          quantity,
          product_image (
            image_filename
          )
        `)
                .in("product_id", productIds);
            if (itemsError)
                throw itemsError;
            const productItemList = items ?? [];
            const idToTotalQty = new Map();
            const idToThumbnail = new Map();
            (productItemList ?? []).forEach((it) => {
                const prev = idToTotalQty.get(it.product_id) ?? 0;
                idToTotalQty.set(it.product_id, prev + (it.quantity ?? 0));
                const firstImage = it.product_image?.[0]?.image_filename;
                if (it.product_id &&
                    firstImage &&
                    !idToThumbnail.has(it.product_id)) {
                    // Get public URL from Supabase Storage
                    const { data: { publicUrl }, } = supabase_1.supabase.storage
                        .from("product-images")
                        .getPublicUrl(firstImage);
                    idToThumbnail.set(it.product_id, publicUrl);
                }
            });
            const withInventory = productList.map((p) => ({
                ...p,
                total_quantity: idToTotalQty.get(p.product_id) ?? 0,
                thumbnail: idToThumbnail.get(p.product_id) ?? null,
            }));
            res.json(withInventory);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
}
//# sourceMappingURL=featured.js.map