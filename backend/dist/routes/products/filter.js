"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerFilterRoutes = registerFilterRoutes;
const supabase_1 = require("../../config/supabase");
function registerFilterRoutes(router) {
    router.post("/filter", async (req, res) => {
        try {
            const { optionIds, categoryId } = req.body;
            const selectedOptionIds = Array.isArray(optionIds)
                ? optionIds.filter((x) => typeof x === "number")
                : [];
            let baseQuery = supabase_1.supabase
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
                .or("is_deleted.is.null,is_deleted.eq.false")
                .order("product_id", { ascending: false });
            if (categoryId) {
                baseQuery = baseQuery.eq("category_id", categoryId);
            }
            const { data: products, error: baseError } = await baseQuery;
            if (baseError)
                throw baseError;
            const baseProducts = products ?? [];
            if (baseProducts.length === 0) {
                res.json([]);
                return;
            }
            const productIds = baseProducts.map((p) => p.product_id);
            if (selectedOptionIds.length === 0) {
                const { data: items, error: itemsError } = await supabase_1.supabase
                    .from("product_item")
                    .select("product_id, quantity")
                    .in("product_id", productIds);
                if (itemsError)
                    throw itemsError;
                const idToTotalQty = new Map();
                (items ?? []).forEach((it) => {
                    const prev = idToTotalQty.get(it.product_id) ?? 0;
                    idToTotalQty.set(it.product_id, prev + (it.quantity ?? 0));
                });
                const withInventory = baseProducts.map((p) => ({
                    ...p,
                    total_quantity: idToTotalQty.get(p.product_id) ?? 0,
                }));
                res.json(withInventory);
                return;
            }
            const { data: itemsWithCfg, error: cfgError } = await supabase_1.supabase
                .from("product_item")
                .select(`
        product_item_id,
        product_id,
        quantity,
        product_configuration (
          variation_option_id
        )
      `)
                .in("product_id", productIds);
            if (cfgError)
                throw cfgError;
            const productIdMatches = new Set();
            (itemsWithCfg ?? []).forEach((it) => {
                const itemOptionIds = new Set((it.product_configuration ?? []).map((c) => c.variation_option_id));
                const hasSome = selectedOptionIds.some((id) => itemOptionIds.has(id));
                if (hasSome)
                    productIdMatches.add(it.product_id);
            });
            const filteredProducts = baseProducts.filter((p) => productIdMatches.has(p.product_id));
            if (filteredProducts.length === 0) {
                res.json([]);
                return;
            }
            const { data: qtyItems, error: qtyError } = await supabase_1.supabase
                .from("product_item")
                .select("product_id, quantity")
                .in("product_id", filteredProducts.map((p) => p.product_id));
            if (qtyError)
                throw qtyError;
            const idToTotalQty = new Map();
            (qtyItems ?? []).forEach((it) => {
                const prev = idToTotalQty.get(it.product_id) ?? 0;
                idToTotalQty.set(it.product_id, prev + (it.quantity ?? 0));
            });
            const withInventory = filteredProducts.map((p) => ({
                ...p,
                total_quantity: idToTotalQty.get(p.product_id) ?? 0,
            }));
            res.json(withInventory);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
}
//# sourceMappingURL=filter.js.map