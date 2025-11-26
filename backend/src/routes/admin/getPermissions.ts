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
        return res
          .status(403)
          .json({ error: "Access denied. Admin role required." });
      }

      let adminId = user.id;
      let actualAdminAccountId = adminId;

      // Query trực tiếp từ các bảng (giống như middleware checkPermission)
      // 1. Lấy role_ids từ admin_roles
      let { data: adminRoles, error: adminRolesError } = await supabase
        .from("admin_roles")
        .select("role_id")
        .eq("admin_account_id", adminId);

      // Nếu không tìm thấy, thử tìm adminaccounts.id từ employee_id (token cũ)
      if ((!adminRoles || adminRoles.length === 0) && !adminRolesError) {
        const { data: adminAccount, error: accountError } = await supabase
          .from("adminaccounts")
          .select("id")
          .eq("employee_id", adminId)
          .single();

        if (!accountError && adminAccount) {
          actualAdminAccountId = adminAccount.id;
          console.log(
            `[getPermissions] Found admin_account_id ${actualAdminAccountId} from employee_id ${user.id}`
          );

          const retryResult = await supabase
            .from("admin_roles")
            .select("role_id")
            .eq("admin_account_id", actualAdminAccountId);

          adminRoles = retryResult.data;
          adminRolesError = retryResult.error;
        }
      }

      adminId = actualAdminAccountId;

      if (adminRolesError) {
        console.error("Error fetching admin roles:", adminRolesError);
        return res.status(500).json({ error: "Lỗi khi lấy quyền" });
      }

      // Trả về empty nếu admin không có roles
      if (!adminRoles || adminRoles.length === 0) {
        console.log(`[getPermissions] Admin ${adminId} không có roles`);
        return res.json({
          permissions: [],
          roles: [],
          permissionCodes: [],
          hasNoRoles: true,
        });
      }

      console.log(
        `[getPermissions] Admin ${adminId} có ${adminRoles.length} roles`
      );

      // 2. Lấy thông tin roles
      const roleIds = adminRoles.map((ar: any) => ar.role_id).filter(Boolean);
      console.log(`[getPermissions] Role IDs:`, roleIds);

      const { data: rolesData, error: rolesError } = await supabase
        .from("roles")
        .select("id, name, description")
        .in("id", roleIds);

      const roles = rolesData || [];
      console.log(`[getPermissions] Found ${roles.length} roles`);

      // 3. Lấy role_permissions
      const { data: rolePermsData, error: rolePermsError } = await supabase
        .from("role_permissions")
        .select("role_id, permission_id")
        .in("role_id", roleIds);

      console.log(`[getPermissions] Role permissions query result:`, {
        count: rolePermsData?.length,
        error: rolePermsError?.message,
      });

      if (rolePermsError) {
        console.error("Error fetching role_permissions:", rolePermsError);
        return res.status(500).json({ error: "Lỗi khi lấy quyền" });
      }

      if (!rolePermsData || rolePermsData.length === 0) {
        console.log(`[getPermissions] No permissions found for roles`);
        return res.json({
          permissions: [],
          roles,
          permissionCodes: [],
          hasNoRoles: false,
        });
      }

      // 4. Lấy permissions
      const permissionIds = [
        ...new Set(
          rolePermsData.map((rp: any) => rp.permission_id).filter(Boolean)
        ),
      ];
      const { data: permissionsData, error: permsError } = await supabase
        .from("permissions")
        .select("id, code, name, module")
        .in("id", permissionIds);

      if (permsError) {
        console.error("Error fetching permissions:", permsError);
        return res.status(500).json({ error: "Lỗi khi lấy quyền" });
      }

      const permissions = permissionsData || [];
      const permissionSet = new Set<string>();
      permissions.forEach((p: any) => {
        if (p.code) {
          permissionSet.add(p.code);
        }
      });

      const result = {
        permissions,
        roles,
        permissionCodes: Array.from(permissionSet),
        hasNoRoles: false,
      };

      console.log(
        `[getPermissions] Returning ${result.permissionCodes.length} permissions:`,
        result.permissionCodes
      );

      return res.json(result);
    } catch (error: any) {
      console.error("Error getting permissions:", error);
      return res.status(500).json({ error: "Lỗi server khi lấy quyền" });
    }
  });
}
