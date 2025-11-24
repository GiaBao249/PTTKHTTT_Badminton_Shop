import { Request, Response, Router } from "express";
import { supabase } from "../../config/supabase";

export function registerCountRoutes(router: Router) {
  router.get("/count", async (req: Request, res: Response) => {
    try {
      const { category, categoryId } = req.query as {
        category?: string;
        categoryId?: string;
      };

      const slugToId: Record<string, number> = {
        all: -1,
        rackets: 1,
        shoes: 2,
        clothes: 3,
        accessories: 4,
        shuttlecocks: 5,
      };

      let resolvedCategoryId: number | null = null;
      if (categoryId) {
        const parsed = Number(categoryId);
        resolvedCategoryId = Number.isFinite(parsed) ? parsed : null;
      } else if (category) {
        const key = String(category).toLowerCase();
        resolvedCategoryId = slugToId[key] ?? null;
      }

      const query = supabase
        .from("product")
        .select("*", { count: "exact", head: true })
        .or("is_deleted.is.null,is_deleted.eq.false");

      const finalQuery =
        resolvedCategoryId && resolvedCategoryId > 0
          ? query.eq("category_id", resolvedCategoryId)
          : query;

      const { count, error } = await finalQuery;
      if (error) throw error;

      res.json({ count: count ?? 0 });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
}
