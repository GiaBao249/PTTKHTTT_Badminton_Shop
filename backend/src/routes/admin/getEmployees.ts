import { Request, Response, Router } from "express";
import { supabase } from "../../config/supabase";

export function registerGetEmployees(router: Router) {
  router.get("/getEmployees", async (req: Request, res: Response) => {
    try {
      const { data: employees, error } = await supabase
        .from("employees")
        .select("*")
        .order("employee_id", { ascending: true });
      if (error) {
        throw error;
      }
      return res.json(employees || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
      return res.status(500).json({
        error: "Lỗi server khi lấy nhân viên",
      });
    }
  });
}

