import { Request, Response, Router } from "express";
import { supabase } from "../../config/supabase";
import { checkPermission } from "../../middleware/checkPermission";

export function registerGetAdminAccounts(router: Router) {
  router.get("/adminAccounts", checkPermission("admin_role:read"), async (req: Request, res: Response) => {
    try {
      const { data: adminAccounts, error } = await supabase
        .from("adminaccounts")
        .select(`
          id,
          username,
          employee_id,
          employees (
            name
          )
        `)
        .order("id", { ascending: true });

      if (error) {
        throw error;
      }

      // Format lại data để dễ sử dụng
      const formattedAccounts = (adminAccounts || []).map((account: any) => ({
        id: account.id,
        username: account.username,
        employee_id: account.employee_id,
        employee: {
          name: account.employees?.name || "",
        },
      }));

      return res.json(formattedAccounts);
    } catch (error: any) {
      console.error("Error fetching admin accounts:", error);
      return res.status(500).json({
        error: "Lỗi server khi lấy danh sách admin",
      });
    }
  });
}

