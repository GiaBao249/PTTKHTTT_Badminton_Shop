import { Request, Response, Router } from "express";
import { supabase } from "../../config/supabase";

export function registerVariationRoutes(router: Router) {
  router.get(
    "/category/:categoryId/variations",
    async (req: Request, res: Response) => {
      try {
        const { categoryId } = req.params;

        const { data, error } = await supabase
          .from("variation")
          .select(
            `
        variation_id,
        name,
        variation_options (
          variation_option_id,
          value
        )
      `
          )
          .eq("category_id", categoryId)
          .order("variation_id", { ascending: true });
        if (error) throw error;

        res.json(data ?? []);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );
}
