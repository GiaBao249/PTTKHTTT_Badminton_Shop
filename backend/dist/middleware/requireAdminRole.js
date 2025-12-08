"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdminRole = void 0;
const supabase_1 = require("../config/supabase");
/**
 * Middleware để đảm bảo admin phải có ít nhất một role
 * Nếu admin không có role nào, từ chối truy cập
 */
const requireAdminRole = async (req, res, next) => {
    try {
        const user = req.user;
        // Kiểm tra user có phải admin không
        if (!user || user.role !== "admin") {
            return res.status(403).json({ error: "Access denied. Admin role required." });
        }
        let adminId = user.id;
        // Log để debug
        console.log(`[requireAdminRole] Checking roles for admin ID from token: ${adminId}`);
        // Kiểm tra admin có ít nhất một role không
        let { data: adminRoles, error: adminRolesError } = await supabase_1.supabase
            .from("admin_roles")
            .select("role_id")
            .eq("admin_account_id", adminId)
            .limit(1);
        // Nếu không tìm thấy và không có lỗi, có thể adminId là employee_id (token cũ)
        // Thử tìm adminaccounts.id từ employee_id
        if ((!adminRoles || adminRoles.length === 0) && !adminRolesError) {
            const { data: adminAccount, error: accountError } = await supabase_1.supabase
                .from("adminaccounts")
                .select("id")
                .eq("employee_id", adminId)
                .single();
            if (!accountError && adminAccount) {
                adminId = adminAccount.id;
                console.log(`[requireAdminRole] Found admin_account_id ${adminId} from employee_id ${user.id}`);
                // Query lại với admin_account_id đúng
                const retryResult = await supabase_1.supabase
                    .from("admin_roles")
                    .select("role_id")
                    .eq("admin_account_id", adminId)
                    .limit(1);
                adminRoles = retryResult.data;
                adminRolesError = retryResult.error;
            }
        }
        // Log kết quả query
        console.log(`[requireAdminRole] Admin ${adminId} - Query result:`, {
            hasRoles: adminRoles && adminRoles.length > 0,
            rolesCount: adminRoles?.length || 0,
            error: adminRolesError?.message || null
        });
        if (adminRolesError) {
            // Kiểm tra xem lỗi có phải do bảng chưa tồn tại không
            const errorMessage = adminRolesError.message || String(adminRolesError);
            if (errorMessage.includes("does not exist") || errorMessage.includes("relation") || errorMessage.includes("table")) {
                console.warn("Bảng admin_roles chưa tồn tại. Cho phép truy cập để setup hệ thống phân quyền.");
                // Cho phép truy cập tạm thời để admin có thể setup permissions
                return next();
            }
            console.error("Error fetching admin roles:", adminRolesError);
            return res.status(500).json({ error: "Error checking admin roles" });
        }
        // Nếu admin không có roles nào, từ chối truy cập
        // Nhưng kiểm tra xem có phải là admin đầu tiên (chưa có admin nào có roles) không
        if (!adminRoles || adminRoles.length === 0) {
            // Kiểm tra xem có admin nào khác đã có roles không (bao gồm cả chính admin này)
            const { data: allAdminRoles, error: checkError } = await supabase_1.supabase
                .from("admin_roles")
                .select("admin_account_id")
                .limit(1);
            // Nếu lỗi do bảng chưa tồn tại, cho phép truy cập để setup
            if (checkError) {
                const errorMsg = checkError.message || String(checkError);
                if (errorMsg.includes("does not exist") || errorMsg.includes("relation") || errorMsg.includes("table")) {
                    console.warn(`Admin ${adminId} là admin đầu tiên. Cho phép truy cập để setup hệ thống phân quyền.`);
                    return next();
                }
            }
            // Nếu chưa có admin nào có roles (bảng tồn tại nhưng rỗng), cho phép admin này truy cập để setup
            if (!allAdminRoles || allAdminRoles.length === 0) {
                console.warn(`Admin ${adminId} là admin đầu tiên. Cho phép truy cập để setup hệ thống phân quyền.`);
                return next();
            }
            // Nếu đã có admin khác có roles, từ chối truy cập
            console.log(`❌ [requireAdminRole] Admin ${adminId} KHÔNG CÓ ROLES. Có ${allAdminRoles?.length || 0} admin khác đã có roles.`);
            return res.status(403).json({
                error: "Access denied. Bạn không có quyền truy cập. Vui lòng liên hệ quản trị viên để được cấp quyền."
            });
        }
        next();
    }
    catch (error) {
        console.error("Require admin role error:", error);
        return res.status(500).json({ error: "Error checking admin roles" });
    }
};
exports.requireAdminRole = requireAdminRole;
//# sourceMappingURL=requireAdminRole.js.map