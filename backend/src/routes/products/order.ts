import { Request, Response, Router } from "express";
import { supabase } from "../../config/supabase";

export function registerOrderRoutes(router: Router) {
  router.get("/order", async (req: Request, res: Response): Promise<void> => {
    try {
      const { data, error } = await supabase.from("order").select("*");
      if (error) throw error;
      if (!data || data.length === 0) {
        res.json([]);
        return;
      }
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
}
