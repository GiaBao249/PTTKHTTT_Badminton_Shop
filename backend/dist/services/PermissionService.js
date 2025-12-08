"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionService = void 0;
// services/PermissionService.ts
const tsyringe_1 = require("tsyringe");
const PermissionRepository_1 = require("../repositories/PermissionRepository");
const errorHandler_1 = require("../middleware/errorHandler");
let PermissionService = class PermissionService {
    constructor(permissionRepo) {
        this.permissionRepo = permissionRepo;
    }
    /**
     * Lấy permissions của admin hiện tại
     */
    async getPermissions(userId) {
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
        const permissions = await this.permissionRepo.getPermissionsByIds(permissionIds);
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
    async getAllRoles() {
        return await this.permissionRepo.getAllRolesWithPermissions();
    }
    /**
     * Tạo role mới
     */
    async createRole(createDto) {
        if (!createDto.name) {
            throw new errorHandler_1.AppError(400, "Tên role là bắt buộc", "VALIDATION_ERROR");
        }
        const role = await this.permissionRepo.createRole(createDto.name, createDto.description);
        // Thêm permissions nếu có
        if (createDto.permission_ids && createDto.permission_ids.length > 0) {
            await this.permissionRepo.addRolePermissions(role.id, createDto.permission_ids);
        }
        return role;
    }
    /**
     * Cập nhật role
     */
    async updateRole(roleId, updateDto) {
        const updateData = {};
        if (updateDto.name !== undefined)
            updateData.name = updateDto.name;
        if (updateDto.description !== undefined)
            updateData.description = updateDto.description;
        if (Object.keys(updateData).length > 0) {
            await this.permissionRepo.updateRole(roleId, updateData);
        }
        // Cập nhật permissions nếu có
        if (updateDto.permission_ids !== undefined) {
            await this.permissionRepo.deleteRolePermissions(roleId);
            if (updateDto.permission_ids.length > 0) {
                await this.permissionRepo.addRolePermissions(roleId, updateDto.permission_ids);
            }
        }
    }
    /**
     * Xóa role
     */
    async deleteRole(roleId) {
        await this.permissionRepo.deleteRole(roleId);
    }
    /**
     * Lấy tất cả permissions
     */
    async getAllPermissions() {
        return await this.permissionRepo.getAllPermissions();
    }
    /**
     * Tạo permission mới
     */
    async createPermission(createDto) {
        if (!createDto.code || !createDto.name) {
            throw new errorHandler_1.AppError(400, "Code và name là bắt buộc", "VALIDATION_ERROR");
        }
        try {
            return await this.permissionRepo.createPermission(createDto.code, createDto.name, createDto.module);
        }
        catch (error) {
            if (error.message?.includes("đã tồn tại")) {
                throw new errorHandler_1.AppError(409, error.message, "DUPLICATE_ERROR");
            }
            throw error;
        }
    }
    /**
     * Cập nhật permission
     */
    async updatePermission(permissionId, updateDto) {
        const updateData = {};
        if (updateDto.code !== undefined)
            updateData.code = updateDto.code;
        if (updateDto.name !== undefined)
            updateData.name = updateDto.name;
        if (updateDto.module !== undefined)
            updateData.module = updateDto.module;
        try {
            await this.permissionRepo.updatePermission(permissionId, updateData);
        }
        catch (error) {
            if (error.message?.includes("đã tồn tại")) {
                throw new errorHandler_1.AppError(409, error.message, "DUPLICATE_ERROR");
            }
            throw error;
        }
    }
    /**
     * Xóa permission
     */
    async deletePermission(permissionId) {
        await this.permissionRepo.deletePermission(permissionId);
    }
    /**
     * Lấy roles của admin
     */
    async getAdminRoles(adminAccountId) {
        return await this.permissionRepo.getAdminRoles(adminAccountId);
    }
    /**
     * Gán roles cho admin
     */
    async assignRolesToAdmin(adminAccountId, roleIds) {
        if (!Array.isArray(roleIds)) {
            throw new errorHandler_1.AppError(400, "role_ids phải là một mảng", "VALIDATION_ERROR");
        }
        // Xóa roles cũ
        await this.permissionRepo.deleteAdminRoles(adminAccountId);
        // Thêm roles mới
        if (roleIds.length > 0) {
            await this.permissionRepo.addAdminRoles(adminAccountId, roleIds);
        }
    }
};
exports.PermissionService = PermissionService;
exports.PermissionService = PermissionService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(PermissionRepository_1.PermissionRepository)),
    __metadata("design:paramtypes", [PermissionRepository_1.PermissionRepository])
], PermissionService);
//# sourceMappingURL=PermissionService.js.map