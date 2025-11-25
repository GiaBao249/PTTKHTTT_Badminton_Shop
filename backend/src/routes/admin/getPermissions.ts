import { Request, Response, Router } from "express";
import { supabase } from "../../config/supabase";

/**
 * API để lấy tất cả permissions của admin hiện tại
 * Route này không yêu cầu roles (cho phép admin xem trạng thái permissions của mình)
 */
export function registerGetPermissions(router: Router) {
  router.get("/getPermissions", async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ error: "Access denied. Admin role required." });
      }

      const adminId = user.id;

      // Lấy tất cả permissions của admin thông qua roles
      const { data: adminRoles, error: adminRolesError } = await supabase
        .from("admin_roles")
        .select(`
          role_id,
          roles (
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
          )
        `)
        .eq("admin_account_id", adminId);

      if (adminRolesError) {
        console.error("Error fetching admin permissions:", adminRolesError);
        return res.status(500).json({ error: "Lỗi khi lấy quyền" });
      }

      // Tập hợp tất cả permissions và roles
      const permissions: any[] = [];
      const roles: any[] = [];
      const permissionSet = new Set<string>();

      // Trả về empty nếu admin không có roles
      if (!adminRoles || adminRoles.length === 0) {
        return res.json({
          permissions: [],
          roles: [],
          permissionCodes: [],
          hasNoRoles: true, // Flag để frontend biết admin chưa có roles
        });
      }

      if (adminRoles && adminRoles.length > 0) {
        for (const adminRole of adminRoles) {
          const role = adminRole.roles as any;
          if (role) {
            // Thêm role vào danh sách
            roles.push({
              id: role.id,
              name: role.name,
              description: role.description,
            });

            // Lấy permissions của role
            if (role.role_permissions) {
              const rolePermissions = Array.isArray(role.role_permissions) 
                ? role.role_permissions 
                : [role.role_permissions];
              
              for (const rp of rolePermissions) {
                const permission = rp.permissions;
                if (permission && !permissionSet.has(permission.code)) {
                  permissionSet.add(permission.code);
                  permissions.push({
                    id: permission.id,
                    code: permission.code,
                    name: permission.name,
                    module: permission.module,
                  });
                }
              }
            }
          }
        }
      }

      return res.json({
        permissions,
        roles,
        permissionCodes: Array.from(permissionSet),
        hasNoRoles: false,
      });
    } catch (error: any) {
      console.error("Error getting permissions:", error);
      return res.status(500).json({ error: "Lỗi server khi lấy quyền" });
    }
  });
}

