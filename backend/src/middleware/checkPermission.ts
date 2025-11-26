import { Request, Response, NextFunction } from "express";
import { supabase } from "../config/supabase";

/**
 * Middleware để kiểm tra permission của admin
 * @param permissionCode - Code của permission cần check (VD: "product:create", "dashboard:read")
 */
export const checkPermission = (permissionCode: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      console.log(
        `🔍 [checkPermission] Checking permission: ${permissionCode} for user:`,
        user?.id
      );

      // Kiểm tra user có phải admin không
      if (!user || user.role !== "admin") {
        return res.status(403).json({
          error: "Access denied. Admin role required.",
          code: "ADMIN_REQUIRED",
        });
      }

      let adminId = user.id;
      let actualAdminAccountId = adminId;

      // Query admin_roles để lấy role_ids
      let { data: adminRoles, error: adminRolesError } = await supabase
        .from("admin_roles")
        .select("role_id")
        .eq("admin_account_id", adminId);

      // Nếu không tìm thấy, thử tìm adminaccounts.id từ employee_id
      if ((!adminRoles || adminRoles.length === 0) && !adminRolesError) {
        const { data: adminAccount, error: accountError } = await supabase
          .from("adminaccounts")
          .select("id")
          .eq("employee_id", adminId)
          .single();

        if (!accountError && adminAccount) {
          actualAdminAccountId = adminAccount.id;
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
        const errorMessage = adminRolesError.message || String(adminRolesError);
        if (
          errorMessage.includes("does not exist") ||
          errorMessage.includes("relation")
        ) {
          console.warn(
            "Bảng admin_roles chưa tồn tại. Cho phép truy cập để setup hệ thống phân quyền."
          );
          return next();
        }
        console.error("Error fetching admin roles:", adminRolesError);
        return res.status(500).json({
          error: "Lỗi hệ thống khi kiểm tra quyền truy cập",
          code: "PERMISSION_CHECK_ERROR",
        });
      }

      // Nếu admin không có roles
      if (!adminRoles || adminRoles.length === 0) {
        const { data: allAdminRoles } = await supabase
          .from("admin_roles")
          .select("admin_account_id")
          .limit(1);

        if (!allAdminRoles || allAdminRoles.length === 0) {
          console.warn(
            `Admin ${adminId} là admin đầu tiên. Cho phép truy cập để setup hệ thống phân quyền.`
          );
          return next();
        }

        return res.status(403).json({
          error:
            "Bạn chưa được phân quyền. Vui lòng liên hệ quản trị viên để được cấp quyền truy cập.",
          code: "NO_ROLES_ASSIGNED",
          message:
            "Admin account chưa được gán roles. Vui lòng liên hệ quản trị viên.",
        });
      }

      // Lấy tất cả role_ids
      const roleIds = adminRoles.map((ar: any) => ar.role_id).filter(Boolean);

      // Query role_permissions trực tiếp
      const { data: rolePermsData, error: rolePermsError } = await supabase
        .from("role_permissions")
        .select("role_id, permission_id")
        .in("role_id", roleIds);

      if (rolePermsError) {
        console.error("Error fetching role_permissions:", rolePermsError);
        return res.status(500).json({
          error: "Lỗi hệ thống khi kiểm tra quyền",
          code: "ROLE_PERMISSIONS_ERROR",
        });
      }

      if (!rolePermsData || rolePermsData.length === 0) {
        return res.status(403).json({
          error:
            "Roles của bạn chưa được gán permissions. Vui lòng liên hệ quản trị viên.",
          code: "NO_PERMISSIONS_IN_ROLES",
          message: "Các roles được gán cho bạn chưa có permissions nào.",
        });
      }

      // Lấy permission_ids
      const permissionIds = [
        ...new Set(
          rolePermsData.map((rp: any) => rp.permission_id).filter(Boolean)
        ),
      ];

      // Query permissions
      const { data: permissionsData, error: permsError } = await supabase
        .from("permissions")
        .select("id, code, name, module")
        .in("id", permissionIds);

      if (permsError) {
        console.error("Error fetching permissions:", permsError);
        return res.status(500).json({
          error: "Lỗi hệ thống khi kiểm tra quyền",
          code: "PERMISSIONS_ERROR",
        });
      }

      if (!permissionsData || permissionsData.length === 0) {
        return res.status(403).json({
          error:
            "Không tìm thấy permissions trong hệ thống. Vui lòng liên hệ quản trị viên.",
          code: "PERMISSIONS_NOT_FOUND",
        });
      }

      // Tạo Set các permission codes
      const userPermissions = new Set<string>();
      permissionsData.forEach((p: any) => {
        if (p.code) {
          userPermissions.add(p.code);
        }
      });

      // Kiểm tra permission
      if (userPermissions.has(permissionCode)) {
        console.log(
          `✅ [checkPermission] Admin ${adminId} có permission: ${permissionCode}`
        );
        return next();
      }

      // KHÔNG CÓ PERMISSION - Trả về thông báo lỗi rõ ràng
      console.log(
        `❌ [checkPermission] Admin ${adminId} KHÔNG CÓ permission: ${permissionCode}`
      );
      console.log(`   Permissions hiện có:`, Array.from(userPermissions));

      return res.status(403).json({
        error: `Bạn không có quyền thực hiện chức năng này. Yêu cầu quyền: ${permissionCode}`,
        code: "PERMISSION_DENIED",
        requiredPermission: permissionCode,
        message: `Bạn cần quyền "${permissionCode}" để truy cập chức năng này. Vui lòng liên hệ quản trị viên để được cấp quyền.`,
        availablePermissions: Array.from(userPermissions),
      });
    } catch (error: any) {
      console.error("Permission check error:", error);
      return res.status(500).json({
        error: "Lỗi hệ thống khi kiểm tra quyền truy cập",
        code: "INTERNAL_ERROR",
      });
    }
  };
};
