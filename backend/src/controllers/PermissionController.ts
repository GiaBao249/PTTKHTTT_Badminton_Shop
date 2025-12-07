import { injectable, inject } from "tsyringe";
import { Request, Response } from "express";
import { PermissionService } from "../services/PermissionService";
import { AppError } from "../middleware/errorHandler";
import {
  CreateRoleDto,
  UpdateRoleDto,
  CreatePermissionDto,
  UpdatePermissionDto,
} from "../models/Permission";

@injectable()
export class PermissionController {
  constructor(
    @inject(PermissionService) private permissionService: PermissionService
  ) {}

  /**
   * GET /api/admin/getPermissions
   * Lấy permissions của admin hiện tại (GIỮ NGUYÊN endpoint cho frontend)
   * Đặc biệt: không cần requireAdminRole
   */
  getPermissions = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = (req as any).user;

      if (!user || user.role !== "admin") {
        res.status(403).json({ error: "Access denied. Admin role required." });
        return;
      }

      const result = await this.permissionService.getPermissions(user.id);
      res.json(result);
    } catch (error: any) {
      if (error instanceof AppError) {
        res
          .status(error.statusCode)
          .json({ error: error.message, code: error.code });
      } else {
        console.error("Error getting permissions:", error);
        res.status(500).json({ error: "Lỗi server khi lấy quyền" });
      }
    }
  };

  /**
   * GET /api/admin/roles
   * Lấy tất cả roles (GIỮ NGUYÊN endpoint cho frontend)
   */
  getAllRoles = async (req: Request, res: Response): Promise<void> => {
    try {
      const roles = await this.permissionService.getAllRoles();
      res.json(roles);
    } catch (error: any) {
      if (error instanceof AppError) {
        res
          .status(error.statusCode)
          .json({ error: error.message, code: error.code });
      } else {
        console.error("Error fetching roles:", error);
        res.status(500).json({ error: "Lỗi khi lấy danh sách roles" });
      }
    }
  };

  /**
   * POST /api/admin/roles
   * Tạo role mới (GIỮ NGUYÊN endpoint cho frontend)
   */
  createRole = async (req: Request, res: Response): Promise<void> => {
    try {
      const createDto: CreateRoleDto = req.body;
      const role = await this.permissionService.createRole(createDto);
      res.status(201).json({ success: true, role });
    } catch (error: any) {
      if (error instanceof AppError) {
        res
          .status(error.statusCode)
          .json({ error: error.message, code: error.code });
      } else {
        console.error("Error creating role:", error);
        res.status(500).json({ error: "Lỗi khi tạo role" });
      }
    }
  };

  /**
   * PUT /api/admin/roles/:id
   * Cập nhật role (GIỮ NGUYÊN endpoint cho frontend)
   */
  updateRole = async (req: Request, res: Response): Promise<void> => {
    try {
      const roleId = parseInt(req.params.id);
      if (isNaN(roleId)) {
        res.status(400).json({ error: "Invalid role ID" });
        return;
      }

      const updateDto: UpdateRoleDto = req.body;
      await this.permissionService.updateRole(roleId, updateDto);
      res.json({ success: true });
    } catch (error: any) {
      if (error instanceof AppError) {
        res
          .status(error.statusCode)
          .json({ error: error.message, code: error.code });
      } else {
        console.error("Error updating role:", error);
        res.status(500).json({ error: "Lỗi khi cập nhật role" });
      }
    }
  };

  /**
   * DELETE /api/admin/roles/:id
   * Xóa role (GIỮ NGUYÊN endpoint cho frontend)
   */
  deleteRole = async (req: Request, res: Response): Promise<void> => {
    try {
      const roleId = parseInt(req.params.id);
      if (isNaN(roleId)) {
        res.status(400).json({ error: "Invalid role ID" });
        return;
      }

      await this.permissionService.deleteRole(roleId);
      res.json({ success: true });
    } catch (error: any) {
      if (error instanceof AppError) {
        res
          .status(error.statusCode)
          .json({ error: error.message, code: error.code });
      } else {
        console.error("Error deleting role:", error);
        res.status(500).json({ error: "Lỗi khi xóa role" });
      }
    }
  };

  /**
   * GET /api/admin/permissions
   * Lấy tất cả permissions (GIỮ NGUYÊN endpoint cho frontend)
   */
  getAllPermissions = async (req: Request, res: Response): Promise<void> => {
    try {
      const permissions = await this.permissionService.getAllPermissions();
      res.json(permissions);
    } catch (error: any) {
      if (error instanceof AppError) {
        res
          .status(error.statusCode)
          .json({ error: error.message, code: error.code });
      } else {
        console.error("Error fetching permissions:", error);
        res.status(500).json({ error: "Lỗi khi lấy danh sách permissions" });
      }
    }
  };

  /**
   * POST /api/admin/permissions
   * Tạo permission mới (GIỮ NGUYÊN endpoint cho frontend)
   */
  createPermission = async (req: Request, res: Response): Promise<void> => {
    try {
      const createDto: CreatePermissionDto = req.body;
      const permission = await this.permissionService.createPermission(
        createDto
      );
      res.status(201).json({ success: true, permission });
    } catch (error: any) {
      if (error instanceof AppError) {
        res
          .status(error.statusCode)
          .json({ error: error.message, code: error.code });
      } else {
        console.error("Error creating permission:", error);
        res.status(500).json({ error: "Lỗi khi tạo permission" });
      }
    }
  };

  /**
   * PUT /api/admin/permissions/:id
   * Cập nhật permission (GIỮ NGUYÊN endpoint cho frontend)
   */
  updatePermission = async (req: Request, res: Response): Promise<void> => {
    try {
      const permissionId = parseInt(req.params.id);
      if (isNaN(permissionId)) {
        res.status(400).json({ error: "Invalid permission ID" });
        return;
      }

      const updateDto: UpdatePermissionDto = req.body;
      await this.permissionService.updatePermission(permissionId, updateDto);
      res.json({ success: true });
    } catch (error: any) {
      if (error instanceof AppError) {
        res
          .status(error.statusCode)
          .json({ error: error.message, code: error.code });
      } else {
        console.error("Error updating permission:", error);
        res.status(500).json({ error: "Lỗi khi cập nhật permission" });
      }
    }
  };

  /**
   * DELETE /api/admin/permissions/:id
   * Xóa permission (GIỮ NGUYÊN endpoint cho frontend)
   */
  deletePermission = async (req: Request, res: Response): Promise<void> => {
    try {
      const permissionId = parseInt(req.params.id);
      if (isNaN(permissionId)) {
        res.status(400).json({ error: "Invalid permission ID" });
        return;
      }

      await this.permissionService.deletePermission(permissionId);
      res.json({ success: true });
    } catch (error: any) {
      if (error instanceof AppError) {
        res
          .status(error.statusCode)
          .json({ error: error.message, code: error.code });
      } else {
        console.error("Error deleting permission:", error);
        res.status(500).json({ error: "Lỗi khi xóa permission" });
      }
    }
  };

  /**
   * GET /api/admin/admin/:adminId/roles
   * Lấy roles của admin (GIỮ NGUYÊN endpoint cho frontend)
   */
  getAdminRoles = async (req: Request, res: Response): Promise<void> => {
    try {
      const adminId = parseInt(req.params.adminId);
      if (isNaN(adminId)) {
        res.status(400).json({ error: "Invalid admin ID" });
        return;
      }

      const roles = await this.permissionService.getAdminRoles(adminId);
      res.json(roles);
    } catch (error: any) {
      if (error instanceof AppError) {
        res
          .status(error.statusCode)
          .json({ error: error.message, code: error.code });
      } else {
        console.error("Error fetching admin roles:", error);
        res.status(500).json({ error: "Lỗi khi lấy roles của admin" });
      }
    }
  };

  /**
   * POST /api/admin/admin/:adminId/roles
   * Gán roles cho admin (GIỮ NGUYÊN endpoint cho frontend)
   */
  assignRolesToAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
      const adminId = parseInt(req.params.adminId);
      if (isNaN(adminId)) {
        res.status(400).json({ error: "Invalid admin ID" });
        return;
      }

      const { role_ids } = req.body;
      await this.permissionService.assignRolesToAdmin(adminId, role_ids);
      res.json({ success: true });
    } catch (error: any) {
      if (error instanceof AppError) {
        res
          .status(error.statusCode)
          .json({ error: error.message, code: error.code });
      } else {
        console.error("Error assigning roles to admin:", error);
        res.status(500).json({ error: "Lỗi khi gán roles cho admin" });
      }
    }
  };
}
