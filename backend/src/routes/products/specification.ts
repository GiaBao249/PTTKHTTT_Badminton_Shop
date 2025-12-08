import { Request, Response, Router } from "express";
import { supabase } from "../../config/supabase";

export function registerSpecificationRoutes(router: Router) {
  router.get("/:id/specification", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { data, error } = await supabase
        .from("product_item")
        .select(
          `
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
        `
        )
        .eq("product_id", id);
      if (error) throw error;
      if (!data || data.length === 0) return res.json([]);

      const specs: { name: string; value: string }[] = [];
      const seen = new Set<string>();

      data.forEach((item: any) => {
        const configs = item.product_configuration ?? [];
        configs.forEach((cfg: any) => {
          const varOpt = cfg.variation_options;
          if (!varOpt || !varOpt.variation) return;

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
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
}
