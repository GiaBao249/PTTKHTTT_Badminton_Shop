import { Request, Response, Router } from "express";
import { supabase } from "../../config/supabase";

export function registerGetCategories(router: Router) {
  router.get("/getCategories", async (req: Request, res: Response) => {
    try {
      const { data: categories, error } = await supabase
        .from("category")
        .select("*")
        .order("category_id", { ascending: true });
      if (error) {
        throw error;
      }
      return res.json(categories || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      return res.status(500).json({
        error: "Lỗi server khi lấy danh mục",
      });
    }
  });
}

