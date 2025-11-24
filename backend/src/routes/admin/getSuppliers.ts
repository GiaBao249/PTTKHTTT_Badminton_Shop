import { Request, Response, Router } from "express";
import { supabase } from "../../config/supabase";

export function registerGetSuppliers(router: Router) {
  router.get("/getSuppliers", async (req: Request, res: Response) => {
    try {
      const { data: suppliers, error } = await supabase
        .from("suppliers")
        .select("*")
        .order("supplier_id", { ascending: true });
      if (error) {
        throw error;
      }
      return res.json(suppliers || []);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      return res.status(500).json({
        error: "Lỗi server khi lấy nhà cung cấp",
      });
    }
  });
}

