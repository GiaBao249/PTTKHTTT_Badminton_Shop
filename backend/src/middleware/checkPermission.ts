// import { Request, Response, NextFunction } from "express";
// import { supabase } from "../config/supabase";

// /**
//  * Middleware để kiểm tra permission của admin
//  * @param permissionCode - Code của permission cần check (VD: "product:create", "user:delete")
//  */
// export const checkPermission = (permissionCode: string) => {
//   return async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const user = (req as any).user;
      
//       // Kiểm tra user có phải admin không
//       if (!user || user.role !== "admin") {
//         return res.status(403).json({ error: "Access denied. Admin role required." });
//       }

//       let adminId = user.id;
      
//       // Log để debug
//       console.log(`[checkPermission] Checking permission ${permissionCode} for admin ID from token: ${adminId}`);

//       // Nếu adminId không tìm thấy roles, có thể đây là employee_id từ token cũ
//       // Cần tìm adminaccounts.id từ employee_id
//       let actualAdminAccountId = adminId;
      
//       // Query đơn giản: chỉ lấy role_id từ admin_roles
//       let { data: adminRoles, error: adminRolesError } = await supabase
//         .from("admin_roles")
//         .select("role_id")
//         .eq("admin_account_id", adminId);
      
//       // Nếu không tìm thấy và có lỗi, có thể adminId là employee_id (token cũ)
//       // Thử tìm adminaccounts.id từ employee_id
//       if ((!adminRoles || adminRoles.length === 0) && !adminRolesError) {
//         const { data: adminAccount, error: accountError } = await supabase
//           .from("adminaccounts")
//           .select("id")
//           .eq("employee_id", adminId)
//           .single();
        
//         if (!accountError && adminAccount) {
//           actualAdminAccountId = adminAccount.id;
//           console.log(`[checkPermission] Found admin_account_id ${actualAdminAccountId} from employee_id ${adminId}`);
          
//           // Query lại với admin_account_id đúng
//           const retryResult = await supabase
//             .from("admin_roles")
//             .select("role_id")
//             .eq("admin_account_id", actualAdminAccountId);
          
//           adminRoles = retryResult.data;
//           adminRolesError = retryResult.error;
//         }
//       }
      
//       // Log kết quả query - IN CHI TIẾT
//       console.log(`\n[checkPermission] Admin ${adminId} (actual: ${actualAdminAccountId}) - Query result:`, {
//         hasRoles: adminRoles && adminRoles.length > 0,
//         rolesCount: adminRoles?.length || 0,
//         error: adminRolesError?.message || null
//       });
      
//       // IN RAW DATA để debug
//       console.log(`[checkPermission] RAW adminRoles data:`, JSON.stringify(adminRoles, null, 2));
      
//       // Update adminId để dùng cho các check sau
//       adminId = actualAdminAccountId;

//       if (adminRolesError) {
//         // Kiểm tra xem lỗi có phải do bảng chưa tồn tại không
//         const errorMessage = adminRolesError.message || String(adminRolesError);
//         if (errorMessage.includes("does not exist") || errorMessage.includes("relation") || errorMessage.includes("table")) {
//           console.warn("Bảng admin_roles chưa tồn tại. Cho phép truy cập để setup hệ thống phân quyền.");
//           // Cho phép truy cập tạm thời để admin có thể setup permissions
//           return next();
//         }
//         console.error("Error fetching admin roles:", adminRolesError);
//         return res.status(500).json({ error: "Error checking permissions" });
//       }

//       // In ra tất cả roles và permissions để debug
//       console.log("\n========== DEBUG PERMISSIONS ==========");
//       console.log(`[checkPermission] Admin ID: ${adminId} (actual: ${actualAdminAccountId})`);
//       console.log(`[checkPermission] Checking for permission: ${permissionCode}`);
//       console.log(`[checkPermission] Total roles found: ${adminRoles?.length || 0}`);
      
//       if (adminRoles && adminRoles.length > 0) {
//         const allPermissions: string[] = [];
//         const allPermissionDetails: any[] = [];
        
//         // Lấy tất cả role_ids
//         const roleIds = adminRoles.map((ar: any) => ar.role_id).filter(Boolean);
//         console.log(`\n--- Role IDs của admin:`, roleIds);
        
//         // Query roles để lấy tên
//         const { data: rolesData, error: rolesError } = await supabase
//           .from("roles")
//           .select("id, name")
//           .in("id", roleIds);
        
//         const roleMap = new Map<number, string>();
//         if (rolesData) {
//           rolesData.forEach((r: any) => {
//             roleMap.set(r.id, r.name);
//             console.log(`  Role ${r.id}: ${r.name}`);
//           });
//         }
        
//         // Query TRỰC TIẾP role_permissions cho tất cả roles
//         console.log(`\n--- Query role_permissions cho các role_ids:`, roleIds);
//         const { data: rolePermsData, error: rolePermsError } = await supabase
//           .from("role_permissions")
//           .select("role_id, permission_id")
//           .in("role_id", roleIds);
        
//         if (rolePermsError) {
//           console.log(`  ❌ Lỗi query role_permissions:`, rolePermsError);
//         } else {
//           console.log(`  ✅ Tìm thấy ${rolePermsData?.length || 0} role_permissions records`);
//           console.log(`  RAW role_permissions:`, JSON.stringify(rolePermsData, null, 2));
          
//           if (rolePermsData && rolePermsData.length > 0) {
//             // Lấy tất cả permission_ids
//             const permissionIds = [...new Set(rolePermsData.map((rp: any) => rp.permission_id).filter(Boolean))];
//             console.log(`  📋 Permission IDs từ role_permissions:`, permissionIds);
//             console.log(`  📋 Số lượng permission_ids unique:`, permissionIds.length);
            
//             if (permissionIds.length === 0) {
//               console.log(`  ⚠️ Không có permission_id nào trong role_permissions!`);
//               console.log(`  💡 Kiểm tra: SELECT * FROM role_permissions WHERE role_id IN (${roleIds.join(', ')});`);
//             } else {
//               // Query permissions
//               console.log(`  🔍 Querying permissions với IDs:`, permissionIds);
//               const { data: permissionsData, error: permsError } = await supabase
//                 .from("permissions")
//                 .select("id, code, name, module")
//                 .in("id", permissionIds);
              
//               if (permsError) {
//                 console.log(`  ❌ Lỗi query permissions:`, permsError);
//                 console.log(`  💡 Kiểm tra: SELECT * FROM permissions WHERE id IN (${permissionIds.join(', ')});`);
//               } else {
//                 console.log(`  ✅ Tìm thấy ${permissionsData?.length || 0} permissions từ database`);
//                 console.log(`  RAW permissions data:`, JSON.stringify(permissionsData, null, 2));
                
//                 if (!permissionsData || permissionsData.length === 0) {
//                   console.log(`  ⚠️ Query permissions trả về rỗng!`);
//                   console.log(`  💡 Có thể permission_ids không tồn tại trong bảng permissions`);
//                   console.log(`  💡 Kiểm tra: SELECT * FROM permissions WHERE id IN (${permissionIds.join(', ')});`);
//                 } else {
//                   // Tạo map permission_id -> permission
//                   const permMap = new Map<number, any>();
//                   permissionsData.forEach((p: any) => {
//                     permMap.set(p.id, p);
//                     console.log(`  📌 Mapped permission: id=${p.id}, code=${p.code}`);
//                   });
                  
//                   console.log(`  🔗 Kết hợp role_permissions với permissions...`);
//                   // Kết hợp role_permissions với permissions
//                   rolePermsData.forEach((rp: any, index: number) => {
//                     const permission = permMap.get(rp.permission_id);
//                     const roleName = roleMap.get(rp.role_id) || 'Unknown';
                    
//                     console.log(`  [${index + 1}] role_id=${rp.role_id}, permission_id=${rp.permission_id}, permission=${permission ? permission.code : 'NOT FOUND'}`);
                    
//                     if (permission) {
//                       const permCode = permission.code;
//                       if (!allPermissions.includes(permCode)) {
//                         allPermissions.push(permCode);
//                         allPermissionDetails.push({
//                           code: permCode,
//                           name: permission.name,
//                           module: permission.module,
//                           role: roleName
//                         });
//                         console.log(`    ✅ Added: ${permCode} (${permission.name}) [${permission.module}] - Role: ${roleName}`);
//                       } else {
//                         console.log(`    ⏭️  Skipped (duplicate): ${permCode}`);
//                       }
//                     } else {
//                       console.log(`    ❌ Không tìm thấy permission với id = ${rp.permission_id} trong permMap!`);
//                       console.log(`    💡 Permission ID ${rp.permission_id} có thể không tồn tại trong bảng permissions`);
//                     }
//                   });
//                 }
//               }
//             }
//           } else {
//             console.log(`  ⚠️ Không tìm thấy role_permissions nào!`);
//             console.log(`  💡 Kiểm tra database: SELECT * FROM role_permissions WHERE role_id IN (${roleIds.join(', ')});`);
//           }
//         }
        
//         console.log(`\n--- TẤT CẢ PERMISSIONS (${allPermissions.length} permissions) ---`);
//         console.log(`Permission codes:`, allPermissions);
//         console.log(`\n--- CHI TIẾT PERMISSIONS ---`);
//         allPermissionDetails.forEach((p, i) => {
//           console.log(`${i + 1}. ${p.code} - ${p.name} [${p.module}] (Role: ${p.role})`);
//         });
        
//         console.log(`\n--- KIỂM TRA PERMISSION ---`);
//         const hasPermission = allPermissions.includes(permissionCode);
//         console.log(`Permission "${permissionCode}" ${hasPermission ? '✅ CÓ' : '❌ KHÔNG CÓ'}`);
//         console.log("========================================\n");
        
//         // Sử dụng hasPermission đã tính ở trên
//         if (!hasPermission) {
//           console.log(`\n❌ [checkPermission] Admin ${adminId} KHÔNG CÓ permission: ${permissionCode}`);
//           console.log(`   Danh sách permissions hiện có:`, allPermissions);
//           console.log(`   Vui lòng kiểm tra lại trong database:\n`);
//           console.log(`   1. Admin có roles không?`);
//           console.log(`      SELECT * FROM admin_roles WHERE admin_account_id = ${adminId};\n`);
//           console.log(`   2. Roles có permissions không?`);
//           console.log(`      SELECT rp.*, p.code, p.name FROM role_permissions rp`);
//           console.log(`      JOIN permissions p ON rp.permission_id = p.id`);
//           console.log(`      WHERE rp.role_id IN (SELECT role_id FROM admin_roles WHERE admin_account_id = ${adminId});\n`);
//           return res.status(403).json({ 
//             error: `Access denied. Required permission: ${permissionCode}` 
//           });
//         }
        
//         console.log(`✅ [checkPermission] Admin ${adminId} CÓ permission: ${permissionCode} - Cho phép truy cập\n`);
//         return next();
//       } else {
//         console.log(`⚠️ Admin không có roles nào!`);
//         console.log("========================================\n");
//       }

//       // Kiểm tra xem admin có permission này không (fallback nếu không vào block trên)
//       let hasPermission = false;
      
//       // Nếu admin không có roles nào, kiểm tra xem có phải admin đầu tiên không
//       if (!adminRoles || adminRoles.length === 0) {
//         // Kiểm tra xem có admin nào khác đã có roles không
//         const { data: allAdminRoles, error: checkError } = await supabase
//           .from("admin_roles")
//           .select("admin_account_id")
//           .limit(1);
        
//         // Nếu lỗi do bảng chưa tồn tại, cho phép truy cập để setup
//         if (checkError) {
//           const errorMsg = checkError.message || String(checkError);
//           if (errorMsg.includes("does not exist") || errorMsg.includes("relation") || errorMsg.includes("table")) {
//             console.warn(`Admin ${adminId} là admin đầu tiên. Cho phép truy cập để setup hệ thống phân quyền.`);
//             return next();
//           }
//         }
        
//         // Nếu chưa có admin nào có roles (bảng tồn tại nhưng rỗng), cho phép admin này truy cập để setup
//         if (!allAdminRoles || allAdminRoles.length === 0) {
//           console.warn(`Admin ${adminId} là admin đầu tiên. Cho phép truy cập để setup hệ thống phân quyền.`);
//           return next();
//         }
        
//         // Nếu đã có admin khác có roles, từ chối truy cập
//         console.log(`Admin ${adminId} không có roles nào`);
//         return res.status(403).json({ 
//           error: `Access denied. Admin không có quyền truy cập. Required permission: ${permissionCode}` 
//         });
//       }
      
//       // Kiểm tra permission - đã có trong allPermissions từ query trực tiếp ở trên
//       // allPermissions đã được populate từ query trực tiếp role_permissions

//       if (!hasPermission) {
//         console.log(`\n❌ [checkPermission] Admin ${adminId} KHÔNG CÓ permission: ${permissionCode}`);
//         console.log(`   Vui lòng kiểm tra lại trong database:\n`);
//         console.log(`   1. Admin có roles không?`);
//         console.log(`      SELECT * FROM admin_roles WHERE admin_account_id = ${adminId};\n`);
//         console.log(`   2. Roles có permissions không?`);
//         console.log(`      SELECT rp.*, p.code, p.name FROM role_permissions rp`);
//         console.log(`      JOIN permissions p ON rp.permission_id = p.id`);
//         console.log(`      WHERE rp.role_id IN (SELECT role_id FROM admin_roles WHERE admin_account_id = ${adminId});\n`);
//         return res.status(403).json({ 
//           error: `Access denied. Required permission: ${permissionCode}` 
//         });
//       }
      
//       console.log(`✅ [checkPermission] Admin ${adminId} CÓ permission: ${permissionCode} - Cho phép truy cập\n`);

//       next();
//     } catch (error: any) {
//       console.error("Permission check error:", error);
//       return res.status(500).json({ error: "Error checking permissions" });
//     }
//   };
// };

import { Request, Response, NextFunction } from "express";
import { supabase } from "../config/supabase";

export const checkPermission = (permissionCode: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;

      // 1. Basic Check
      if (!user || user.role !== "admin") {
        return res.status(403).json({ error: "Access denied. Admin role required." });
      }

      // Xử lý logic adminId/employeeId như cũ của bạn (đã rút gọn cho dễ nhìn)
      let adminId = user.id;
      // ... (Giữ lại đoạn logic fix employee_id của bạn nếu cần thiết) ...

      console.log(`Checking permission '${permissionCode}' for admin ${adminId}...`);

      // 2. QUERY TỐI ƯU: Join từ admin_roles -> role_permissions -> permissions
      // Lưu ý: Cần đảm bảo Foreign Keys trong database đã được thiết lập đúng
      const { data: adminData, error } = await supabase
        .from("admin_roles")
        .select(`
          role_id,
          roles:roles (
            id,
            name,
            role_permissions (
              permissions (
                code
              )
            )
          )
        `)
        .eq("admin_account_id", adminId);

      if (error) {
        console.error("Supabase Query Error:", error);
        return res.status(500).json({ error: "Database error checking permissions" });
      }

      // 3. FLATTEN DATA: Gom tất cả permission code vào 1 mảng duy nhất
      // Cấu trúc trả về sẽ lồng nhau, ta cần "làm phẳng" nó
      const userPermissions = new Set<string>();

      if (adminData) {
        adminData.forEach((row: any) => {
          // row.roles là object hoặc mảng tùy quan hệ 1-1 hay 1-n
          const role = Array.isArray(row.roles) ? row.roles[0] : row.roles;
          
          if (role && role.role_permissions) {
            role.role_permissions.forEach((rp: any) => {
              if (rp.permissions && rp.permissions.code) {
                userPermissions.add(rp.permissions.code);
              }
            });
          }
        });
      }

      // Debug log gọn gàng
      console.log("User Permissions Found:", Array.from(userPermissions));

      // 4. CHECK FINAL
      if (userPermissions.has(permissionCode)) {
        console.log("✅ Permission Granted");
        return next();
      } else {
        console.log("❌ Permission Denied");
        return res.status(403).json({ 
          error: `Access denied. Required permission: ${permissionCode}` 
        });
      }

    } catch (err) {
      console.error("Middleware Error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  };
};