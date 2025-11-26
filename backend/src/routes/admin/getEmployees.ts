import { Request, Response, Router } from "express";
import { supabase } from "../../config/supabase";
import { checkPermission } from "../../middleware/checkPermission";

export function registerGetEmployees(router: Router) {
  router.get("/getEmployees", checkPermission("employee:read"), async (req: Request, res: Response) => {
    try {
      console.log("Fetching employees...");
      const { data: employees, error } = await supabase
        .from("employees")
        .select("*")
        .order("employ_id", { ascending: true });
      
      if (error) {
        console.error("Supabase error fetching employees:", error);
        return res.status(500).json({
          error: "Lỗi khi truy vấn database: " + (error.message || JSON.stringify(error)),
        });
      }
      
      console.log(`Successfully fetched ${employees?.length || 0} employees`);
      // Map employ_id to employee_id for frontend compatibility
      const mappedEmployees = (employees || []).map((emp: any) => ({
        ...emp,
        employee_id: emp.employ_id,
      }));
      return res.json(mappedEmployees);
    } catch (error: any) {
      console.error("Error fetching employees:", error);
      return res.status(500).json({
        error: "Lỗi server khi lấy nhân viên: " + (error?.message || "Lỗi không xác định"),
      });
    }
  });
}

