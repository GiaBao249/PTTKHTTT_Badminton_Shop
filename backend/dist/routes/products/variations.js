"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerVariationRoutes = registerVariationRoutes;
const supabase_1 = require("../../config/supabase");
function registerVariationRoutes(router) {
    router.get("/category/:categoryId/variations", async (req, res) => {
        try {
            const { categoryId } = req.params;
            const { data, error } = await supabase_1.supabase
                .from("variation")
                .select(`
        variation_id,
        name,
        variation_options (
          variation_option_id,
          value
        )
      `)
                .eq("category_id", categoryId)
                .order("variation_id", { ascending: true });
            if (error)
                throw error;
            res.json(data ?? []);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
}
//# sourceMappingURL=variations.js.map