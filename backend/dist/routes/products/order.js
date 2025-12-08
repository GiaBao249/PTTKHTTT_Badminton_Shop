"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerOrderRoutes = registerOrderRoutes;
const supabase_1 = require("../../config/supabase");
function registerOrderRoutes(router) {
    router.get("/order", async (req, res) => {
        try {
            const { data, error } = await supabase_1.supabase.from("order").select("*");
            if (error)
                throw error;
            if (!data || data.length === 0) {
                res.json([]);
                return;
            }
            res.json(data);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
}
//# sourceMappingURL=order.js.map