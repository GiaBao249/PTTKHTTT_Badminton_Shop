import { Request, Response } from "express";
import { PermissionService } from "../services/PermissionService";
export declare class PermissionController {
    private permissionService;
    constructor(permissionService: PermissionService);
    /**
     * GET /api/admin/getPermissions
     * Lấy permissions của admin hiện tại (GIỮ NGUYÊN endpoint cho frontend)
     * Đặc biệt: không cần requireAdminRole
     */
    getPermissions: (req: Request, res: Response) => Promise<void>;
    /**
     * GET /api/admin/roles
     * Lấy tất cả roles (GIỮ NGUYÊN endpoint cho frontend)
     */
    getAllRoles: (req: Request, res: Response) => Promise<void>;
    /**
     * POST /api/admin/roles
     * Tạo role mới (GIỮ NGUYÊN endpoint cho frontend)
     */
    createRole: (req: Request, res: Response) => Promise<void>;
    /**
     * PUT /api/admin/roles/:id
     * Cập nhật role (GIỮ NGUYÊN endpoint cho frontend)
     */
    updateRole: (req: Request, res: Response) => Promise<void>;
    /**
     * DELETE /api/admin/roles/:id
     * Xóa role (GIỮ NGUYÊN endpoint cho frontend)
     */
    deleteRole: (req: Request, res: Response) => Promise<void>;
    /**
     * GET /api/admin/permissions
     * Lấy tất cả permissions (GIỮ NGUYÊN endpoint cho frontend)
     */
    getAllPermissions: (req: Request, res: Response) => Promise<void>;
    /**
     * POST /api/admin/permissions
     * Tạo permission mới (GIỮ NGUYÊN endpoint cho frontend)
     */
    createPermission: (req: Request, res: Response) => Promise<void>;
    /**
     * PUT /api/admin/permissions/:id
     * Cập nhật permission (GIỮ NGUYÊN endpoint cho frontend)
     */
    updatePermission: (req: Request, res: Response) => Promise<void>;
    /**
     * DELETE /api/admin/permissions/:id
     * Xóa permission (GIỮ NGUYÊN endpoint cho frontend)
     */
    deletePermission: (req: Request, res: Response) => Promise<void>;
    /**
     * GET /api/admin/admin/:adminId/roles
     * Lấy roles của admin (GIỮ NGUYÊN endpoint cho frontend)
     */
    getAdminRoles: (req: Request, res: Response) => Promise<void>;
    /**
     * POST /api/admin/admin/:adminId/roles
     * Gán roles cho admin (GIỮ NGUYÊN endpoint cho frontend)
     */
    assignRolesToAdmin: (req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=PermissionController.d.ts.map