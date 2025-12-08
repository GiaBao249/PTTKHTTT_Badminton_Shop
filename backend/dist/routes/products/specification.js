"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSpecificationRoutes = registerSpecificationRoutes;
const supabase_1 = require("../../config/supabase");
function registerSpecificationRoutes(router) {
    router.get("/:id/specification", async (req, res) => {
        try {
            const { id } = req.params;
            const { data, error } = await supabase_1.supabase
                .from("product_item")
                .select(`
          product_item_id,
          product_id,
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
                .eq("product_id", id);
            if (error)
                throw error;
            if (!data || data.length === 0) {
                res.json([]);
                return;
            }
            const specs = [];
            const seen = new Set();
            data.forEach((item) => {
                const configs = item.product_configuration ?? [];
                configs.forEach((cfg) => {
                    const varOpt = cfg.variation_options;
                    if (!varOpt || !varOpt.variation)
                        return;
                    const key = `${varOpt.variation.name}:${varOpt.value}`;
                    if (!seen.has(key)) {
                        seen.add(key);
                        specs.push({
                            name: varOpt.variation.name,
                            value: varOpt.value,
                        });
                    }
                });
            });
            res.json(specs);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
}
//# sourceMappingURL=specification.js.map