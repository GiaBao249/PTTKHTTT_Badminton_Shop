import { Request, Response, Router } from "express";
import { supabase } from "../../config/supabase";
import { checkPermission } from "../../middleware/checkPermission";

/**
 * API để quản lý roles và permissions
 */
export function registerManageRoles(router: Router) {
  // Lấy tất cả roles
  router.get("/roles", checkPermission("role:read"), async (req: Request, res: Response) => {
    try {
      const { data: roles, error } = await supabase
        .from("roles")
        .select(`
          id,
          name,
          description,
          role_permissions (
            permission_id,
            permissions (
              id,
              code,
              name,
              module
            )
          )
        `)
        .order("id", { ascending: true });

      if (error) throw error;

      // Format lại data
      const formattedRoles = (roles || []).map((role: any) => ({
        id: role.id,
        name: role.name,
        description: role.description,
        permissions: Array.isArray(role.role_permissions)
          ? role.role_permissions.map((rp: any) => rp.permissions).filter(Boolean)
          : role.role_permissions?.permissions 
          ? [role.role_permissions.permissions]
          : [],
      }));

      return res.json(formattedRoles);
    } catch (error: any) {
      console.error("Error fetching roles:", error);
      return res.status(500).json({ error: "Lỗi khi lấy danh sách roles" });
    }
  });

  // Tạo role mới
  router.post("/roles", checkPermission("role:create"), async (req: Request, res: Response) => {
    try {
      const { name, description, permission_ids } = req.body;

      if (!name) {
        return res.status(400).json({ error: "Tên role là bắt buộc" });
      }

      // Tạo role
      const { data: newRole, error: roleError } = await supabase
        .from("roles")
        .insert([{ name, description: description || "" }])
        .select()
        .single();

      if (roleError) throw roleError;

      // Thêm permissions nếu có
      if (permission_ids && Array.isArray(permission_ids) && permission_ids.length > 0) {
        const rolePermissions = permission_ids.map((permission_id: number) => ({
          role_id: newRole.id,
          permission_id,
        }));

        const { error: rpError } = await supabase
          .from("role_permissions")
          .insert(rolePermissions);

        if (rpError) throw rpError;
      }

      return res.status(201).json({ success: true, role: newRole });
    } catch (error: any) {
      console.error("Error creating role:", error);
      return res.status(500).json({ error: "Lỗi khi tạo role" });
    }
  });

  // Cập nhật role
  router.put("/roles/:id", checkPermission("role:update"), async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name, description, permission_ids } = req.body;

      // Cập nhật role
      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;

      if (Object.keys(updateData).length > 0) {
        const { error: updateError } = await supabase
          .from("roles")
          .update(updateData)
          .eq("id", Number(id));

        if (updateError) throw updateError;
      }

      // Cập nhật permissions nếu có
      if (permission_ids !== undefined && Array.isArray(permission_ids)) {
        // Xóa permissions cũ
        const { error: deleteError } = await supabase
          .from("role_permissions")
          .delete()
          .eq("role_id", Number(id));

        if (deleteError) throw deleteError;

        // Thêm permissions mới
        if (permission_ids.length > 0) {
          const rolePermissions = permission_ids.map((permission_id: number) => ({
            role_id: Number(id),
            permission_id,
          }));

          const { error: insertError } = await supabase
            .from("role_permissions")
            .insert(rolePermissions);

          if (insertError) throw insertError;
        }
      }

      return res.json({ success: true });
    } catch (error: any) {
      console.error("Error updating role:", error);
      return res.status(500).json({ error: "Lỗi khi cập nhật role" });
    }
  });

  // Xóa role
  router.delete("/roles/:id", checkPermission("role:delete"), async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      // Xóa role_permissions trước
      const { error: rpError } = await supabase
        .from("role_permissions")
        .delete()
        .eq("role_id", Number(id));

      if (rpError) throw rpError;

      // Xóa admin_roles
      const { error: arError } = await supabase
        .from("admin_roles")
        .delete()
        .eq("role_id", Number(id));

      if (arError) throw arError;

      // Xóa role
      const { error: roleError } = await supabase
        .from("roles")
        .delete()
        .eq("id", Number(id));

      if (roleError) throw roleError;

      return res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting role:", error);
      return res.status(500).json({ error: "Lỗi khi xóa role" });
    }
  });
}

