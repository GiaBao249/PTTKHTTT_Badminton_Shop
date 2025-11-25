import { Request, Response, Router } from "express";
import { supabase } from "../../config/supabase";
import { checkPermission } from "../../middleware/checkPermission";

/**
 * API để quản lý permissions
 */
export function registerManagePermissions(router: Router) {
  // Lấy tất cả permissions
  router.get("/permissions", checkPermission("permission:read"), async (req: Request, res: Response) => {
    try {
      const { data: permissions, error } = await supabase
        .from("permissions")
        .select("*")
        .order("module", { ascending: true })
        .order("code", { ascending: true });

      if (error) throw error;

      return res.json(permissions || []);
    } catch (error: any) {
      console.error("Error fetching permissions:", error);
      return res.status(500).json({ error: "Lỗi khi lấy danh sách permissions" });
    }
  });

  // Tạo permission mới
  router.post("/permissions", checkPermission("permission:manage"), async (req: Request, res: Response) => {
    try {
      const { code, name, module } = req.body;

      if (!code || !name) {
        return res.status(400).json({ error: "Code và name là bắt buộc" });
      }

      const { data: newPermission, error } = await supabase
        .from("permissions")
        .insert([{ code, name, module: module || "" }])
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          return res.status(409).json({ error: "Permission code đã tồn tại" });
        }
        throw error;
      }

      return res.status(201).json({ success: true, permission: newPermission });
    } catch (error: any) {
      console.error("Error creating permission:", error);
      return res.status(500).json({ error: "Lỗi khi tạo permission" });
    }
  });

  // Cập nhật permission
  router.put("/permissions/:id", checkPermission("permission:manage"), async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { code, name, module } = req.body;

      const updateData: any = {};
      if (code !== undefined) updateData.code = code;
      if (name !== undefined) updateData.name = name;
      if (module !== undefined) updateData.module = module;

      const { error } = await supabase
        .from("permissions")
        .update(updateData)
        .eq("id", Number(id));

      if (error) {
        if (error.code === "23505") {
          return res.status(409).json({ error: "Permission code đã tồn tại" });
        }
        throw error;
      }

      return res.json({ success: true });
    } catch (error: any) {
      console.error("Error updating permission:", error);
      return res.status(500).json({ error: "Lỗi khi cập nhật permission" });
    }
  });

  // Xóa permission
  router.delete("/permissions/:id", checkPermission("permission:manage"), async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      // Xóa role_permissions trước
      const { error: rpError } = await supabase
        .from("role_permissions")
        .delete()
        .eq("permission_id", Number(id));

      if (rpError) throw rpError;

      // Xóa permission
      const { error: permError } = await supabase
        .from("permissions")
        .delete()
        .eq("id", Number(id));

      if (permError) throw permError;

      return res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting permission:", error);
      return res.status(500).json({ error: "Lỗi khi xóa permission" });
    }
  });
}

