"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCountRoutes = registerCountRoutes;
const supabase_1 = require("../../config/supabase");
function registerCountRoutes(router) {
    router.get("/count", async (req, res) => {
        try {
            const { category, categoryId } = req.query;
            const slugToId = {
                all: -1,
                rackets: 1,
                shoes: 2,
                clothes: 3,
                accessories: 4,
                shuttlecocks: 5,
            };
            let resolvedCategoryId = null;
            if (categoryId) {
                const parsed = Number(categoryId);
                resolvedCategoryId = Number.isFinite(parsed) ? parsed : null;
            }
            else if (category) {
                const key = String(category).toLowerCase();
                resolvedCategoryId = slugToId[key] ?? null;
            }
            const query = supabase_1.supabase
                .from("product")
                .select("*", { count: "exact", head: true })
                .or("is_deleted.is.null,is_deleted.eq.false");
            const finalQuery = resolvedCategoryId && resolvedCategoryId > 0
                ? query.eq("category_id", resolvedCategoryId)
                : query;
            const { count, error } = await finalQuery;
            if (error)
                throw error;
            res.json({ count: count ?? 0 });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
}
//# sourceMappingURL=count.js.map