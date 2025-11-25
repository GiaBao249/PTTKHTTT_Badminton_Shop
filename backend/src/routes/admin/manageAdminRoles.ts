import { Request, Response, Router } from "express";
import { supabase } from "../../config/supabase";
import { checkPermission } from "../../middleware/checkPermission";

/**
 * API để quản lý việc gán roles cho admin
 */
export function registerManageAdminRoles(router: Router) {
  // Lấy roles của một admin
  router.get("/admin/:adminId/roles", checkPermission("admin_role:read"), async (req: Request, res: Response) => {
    try {
      const { adminId } = req.params;

      const { data: adminRoles, error } = await supabase
        .from("admin_roles")
        .select(`
          role_id,
          roles (
            id,
            name,
            description
          )
        `)
        .eq("admin_account_id", Number(adminId));

      if (error) throw error;

      const roles = (adminRoles || []).map((ar: any) => ar.roles).filter(Boolean);
      return res.json(roles);
    } catch (error: any) {
      console.error("Error fetching admin roles:", error);
      return res.status(500).json({ error: "Lỗi khi lấy roles của admin" });
    }
  });

  // Gán roles cho admin
  router.post("/admin/:adminId/roles", checkPermission("admin_role:update"), async (req: Request, res: Response) => {
    try {
      const { adminId } = req.params;
      const { role_ids } = req.body;

      if (!role_ids || !Array.isArray(role_ids)) {
        return res.status(400).json({ error: "role_ids phải là một mảng" });
      }

      // Xóa roles cũ
      const { error: deleteError } = await supabase
        .from("admin_roles")
        .delete()
        .eq("admin_account_id", Number(adminId));

      if (deleteError) throw deleteError;

      // Thêm roles mới
      if (role_ids.length > 0) {
        const adminRoles = role_ids.map((role_id: number) => ({
          admin_account_id: Number(adminId),
          role_id,
        }));

        const { error: insertError } = await supabase
          .from("admin_roles")
          .insert(adminRoles);

        if (insertError) throw insertError;
      }

      return res.json({ success: true });
    } catch (error: any) {
      console.error("Error assigning roles to admin:", error);
      return res.status(500).json({ error: "Lỗi khi gán roles cho admin" });
    }
  });
}

