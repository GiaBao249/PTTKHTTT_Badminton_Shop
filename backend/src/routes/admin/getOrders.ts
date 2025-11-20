import { Request, Response, Router } from "express";
import { supabase } from "../../config/supabase";

export function registerOrderRoutes(router: Router) {
  router.get("/getOrders", async (req: Request, res: Response) => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("order_id", { ascending: false });
      if (error) throw error;
      if (!data || data.length === 0) return res.json([]);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
}
