// services/PermissionService.ts
import { injectable, inject } from "tsyringe";
import { PermissionRepository } from "../repositories/PermissionRepository";
import {
  GetPermissionsResponse,
  Role,
  Permission,
  CreateRoleDto,
  UpdateRoleDto,
  CreatePermissionDto,
  UpdatePermissionDto,
} from "../models/Permission";
import { AppError } from "../middleware/errorHandler";

@injectable()
export class PermissionService {
  constructor(
    @inject(PermissionRepository) private permissionRepo: PermissionRepository
  ) {}

  /**
   * Lấy permissions của admin hiện tại
   */
  async getPermissions(userId: number): Promise<GetPermissionsResponse> {
    // Lấy admin account ID
    const adminAccountId = await this.permissionRepo.getAdminAccountId(userId);

    if (!adminAccountId) {
      return {
        permissions: [],
        roles: [],
        permissionCodes: [],
        hasNoRoles: true,
      };
    }

    // Lấy role IDs
    const roleIds = await this.permissionRepo.getAdminRoleIds(adminAccountId);

    if (roleIds.length === 0) {
      return {
        permissions: [],
        roles: [],
        permissionCodes: [],
        hasNoRoles: true,
      };
    }

    // Query song song
    const [roles, rolePermMap] = await Promise.all([
      this.permissionRepo.getRolesByIds(roleIds),
      this.permissionRepo.getRolePermissionsByRoleIds(roleIds),
    ]);

    // Lấy permission IDs
    const permissionIds = [...new Set(Array.from(rolePermMap.values()).flat())];

    if (permissionIds.length === 0) {
      return {
        permissions: [],
        roles,
        permissionCodes: [],
        hasNoRoles: false,
      };
    }

    // Lấy permissions
    const permissions = await this.permissionRepo.getPermissionsByIds(
      permissionIds
    );
    const permissionCodes = permissions.map((p) => p.code).filter(Boolean);

    return {
      permissions,
      roles,
      permissionCodes,
      hasNoRoles: false,
    };
  }

  /**
   * Lấy tất cả roles với permissions
   */
  async getAllRoles(): Promise<Role[]> {
    return await this.permissionRepo.getAllRolesWithPermissions();
  }

  /**
   * Tạo role mới
   */
  async createRole(createDto: CreateRoleDto): Promise<Role> {
    if (!createDto.name) {
      throw new AppError(400, "Tên role là bắt buộc", "VALIDATION_ERROR");
    }

    const role = await this.permissionRepo.createRole(
      createDto.name,
      createDto.description
    );

    // Thêm permissions nếu có
    if (createDto.permission_ids && createDto.permission_ids.length > 0) {
      await this.permissionRepo.addRolePermissions(
        role.id,
        createDto.permission_ids
      );
    }

    return role;
  }

  /**
   * Cập nhật role
   */
  async updateRole(roleId: number, updateDto: UpdateRoleDto): Promise<void> {
    const updateData: { name?: string; description?: string } = {};
    if (updateDto.name !== undefined) updateData.name = updateDto.name;
    if (updateDto.description !== undefined)
      updateData.description = updateDto.description;

    if (Object.keys(updateData).length > 0) {
      await this.permissionRepo.updateRole(roleId, updateData);
    }

    // Cập nhật permissions nếu có
    if (updateDto.permission_ids !== undefined) {
      await this.permissionRepo.deleteRolePermissions(roleId);
      if (updateDto.permission_ids.length > 0) {
        await this.permissionRepo.addRolePermissions(
          roleId,
          updateDto.permission_ids
        );
      }
    }
  }

  /**
   * Xóa role
   */
  async deleteRole(roleId: number): Promise<void> {
    await this.permissionRepo.deleteRole(roleId);
  }

  /**
   * Lấy tất cả permissions
   */
  async getAllPermissions(): Promise<Permission[]> {
    return await this.permissionRepo.getAllPermissions();
  }

  /**
   * Tạo permission mới
   */
  async createPermission(createDto: CreatePermissionDto): Promise<Permission> {
    if (!createDto.code || !createDto.name) {
      throw new AppError(400, "Code và name là bắt buộc", "VALIDATION_ERROR");
    }

    try {
      return await this.permissionRepo.createPermission(
        createDto.code,
        createDto.name,
        createDto.module
      );
    } catch (error: any) {
      if (error.message?.includes("đã tồn tại")) {
        throw new AppError(409, error.message, "DUPLICATE_ERROR");
      }
      throw error;
    }
  }

  /**
   * Cập nhật permission
   */
  async updatePermission(
    permissionId: number,
    updateDto: UpdatePermissionDto
  ): Promise<void> {
    const updateData: { code?: string; name?: string; module?: string } = {};
    if (updateDto.code !== undefined) updateData.code = updateDto.code;
    if (updateDto.name !== undefined) updateData.name = updateDto.name;
    if (updateDto.module !== undefined) updateData.module = updateDto.module;

    try {
      await this.permissionRepo.updatePermission(permissionId, updateData);
    } catch (error: any) {
      if (error.message?.includes("đã tồn tại")) {
        throw new AppError(409, error.message, "DUPLICATE_ERROR");
      }
      throw error;
    }
  }

  /**
   * Xóa permission
   */
  async deletePermission(permissionId: number): Promise<void> {
    await this.permissionRepo.deletePermission(permissionId);
  }

  /**
   * Lấy roles của admin
   */
  async getAdminRoles(adminAccountId: number): Promise<Role[]> {
    return await this.permissionRepo.getAdminRoles(adminAccountId);
  }

  /**
   * Gán roles cho admin
   */
  async assignRolesToAdmin(
    adminAccountId: number,
    roleIds: number[]
  ): Promise<void> {
    if (!Array.isArray(roleIds)) {
      throw new AppError(400, "role_ids phải là một mảng", "VALIDATION_ERROR");
    }

    // Xóa roles cũ
    await this.permissionRepo.deleteAdminRoles(adminAccountId);

    // Thêm roles mới
    if (roleIds.length > 0) {
      await this.permissionRepo.addAdminRoles(adminAccountId, roleIds);
    }
  }
}
