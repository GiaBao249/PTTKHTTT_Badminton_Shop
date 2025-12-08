"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionRepository = void 0;
const tsyringe_1 = require("tsyringe");
const supabase_1 = require("../config/supabase");
let PermissionRepository = class PermissionRepository {
    async getAdminAccountId(userId) {
        const { data: adminRoles, error } = await supabase_1.supabase
            .from("admin_roles")
            .select("admin_account_id")
            .eq("admin_account_id", userId)
            .limit(1);
        if (!error && adminRoles && adminRoles.length > 0) {
            return userId;
        }
        const { data: adminAccount, error: accountError } = await supabase_1.supabase
            .from("adminaccounts")
            .select("id")
            .eq("employee_id", userId)
            .single();
        if (!accountError && adminAccount) {
            return adminAccount.id;
        }
        return null;
    }
    async getAdminRoleIds(adminAccountId) {
        const { data, error } = await supabase_1.supabase
            .from("admin_roles")
            .select("role_id")
            .eq("admin_account_id", adminAccountId);
        if (error)
            throw error;
        return (data ?? []).map((ar) => ar.role_id).filter(Boolean);
    }
    async getRolesByIds(roleIds) {
        if (roleIds.length === 0)
            return [];
        const { data, error } = await supabase_1.supabase
            .from("roles")
            .select("id, name, description")
            .in("id", roleIds);
        if (error)
            throw error;
        return data ?? [];
    }
    async getRolePermissionsByRoleIds(roleIds) {
        if (roleIds.length === 0)
            return new Map();
        const { data, error } = await supabase_1.supabase
            .from("role_permissions")
            .select("role_id, permission_id")
            .in("role_id", roleIds);
        if (error)
            throw error;
        const rolePermMap = new Map();
        (data ?? []).forEach((rp) => {
            if (!rolePermMap.has(rp.role_id)) {
                rolePermMap.set(rp.role_id, []);
            }
            rolePermMap.get(rp.role_id).push(rp.permission_id);
        });
        return rolePermMap;
    }
    async getPermissionsByIds(permissionIds) {
        if (permissionIds.length === 0)
            return [];
        const { data, error } = await supabase_1.supabase
            .from("permissions")
            .select("id, code, name, module")
            .in("id", permissionIds);
        if (error)
            throw error;
        return data ?? [];
    }
    async getAllRolesWithPermissions() {
        const { data, error } = await supabase_1.supabase
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
        if (error)
            throw error;
        // Format lại data
        return (data ?? []).map((role) => ({
            id: role.id,
            name: role.name,
            description: role.description,
            permissions: Array.isArray(role.role_permissions)
                ? role.role_permissions.map((rp) => rp.permissions).filter(Boolean)
                : role.role_permissions?.permissions
                    ? [role.role_permissions.permissions]
                    : [],
        }));
    }
    /**
     * Tạo role mới
     */
    async createRole(name, description) {
        const { data, error } = await supabase_1.supabase
            .from("roles")
            .insert([{ name, description: description || "" }])
            .select()
            .single();
        if (error)
            throw error;
        return data;
    }
    /**
     * Thêm role permissions
     */
    async addRolePermissions(roleId, permissionIds) {
        if (permissionIds.length === 0)
            return;
        const rolePermissions = permissionIds.map((permission_id) => ({
            role_id: roleId,
            permission_id,
        }));
        const { error } = await supabase_1.supabase
            .from("role_permissions")
            .insert(rolePermissions);
        if (error)
            throw error;
    }
    /**
     * Xóa role permissions
     */
    async deleteRolePermissions(roleId) {
        const { error } = await supabase_1.supabase
            .from("role_permissions")
            .delete()
            .eq("role_id", roleId);
        if (error)
            throw error;
    }
    /**
     * Cập nhật role
     */
    async updateRole(roleId, updateData) {
        const { error } = await supabase_1.supabase
            .from("roles")
            .update(updateData)
            .eq("id", roleId);
        if (error)
            throw error;
    }
    /**
     * Xóa role (cascade delete)
     */
    async deleteRole(roleId) {
        // Xóa role_permissions trước
        await this.deleteRolePermissions(roleId);
        // Xóa admin_roles
        const { error: arError } = await supabase_1.supabase
            .from("admin_roles")
            .delete()
            .eq("role_id", roleId);
        if (arError)
            throw arError;
        // Xóa role
        const { error: roleError } = await supabase_1.supabase
            .from("roles")
            .delete()
            .eq("id", roleId);
        if (roleError)
            throw roleError;
    }
    /**
     * Lấy tất cả permissions
     */
    async getAllPermissions() {
        const { data, error } = await supabase_1.supabase
            .from("permissions")
            .select("*")
            .order("module", { ascending: true })
            .order("code", { ascending: true });
        if (error)
            throw error;
        return data ?? [];
    }
    /**
     * Tạo permission mới
     */
    async createPermission(code, name, module) {
        const { data, error } = await supabase_1.supabase
            .from("permissions")
            .insert([{ code, name, module: module || "" }])
            .select()
            .single();
        if (error) {
            if (error.code === "23505") {
                throw new Error("Permission code đã tồn tại");
            }
            throw error;
        }
        return data;
    }
    /**
     * Cập nhật permission
     */
    async updatePermission(permissionId, updateData) {
        const { error } = await supabase_1.supabase
            .from("permissions")
            .update(updateData)
            .eq("id", permissionId);
        if (error) {
            if (error.code === "23505") {
                throw new Error("Permission code đã tồn tại");
            }
            throw error;
        }
    }
    /**
     * Xóa permission (cascade delete)
     */
    async deletePermission(permissionId) {
        // Xóa role_permissions trước
        const { error: rpError } = await supabase_1.supabase
            .from("role_permissions")
            .delete()
            .eq("permission_id", permissionId);
        if (rpError)
            throw rpError;
        // Xóa permission
        const { error: permError } = await supabase_1.supabase
            .from("permissions")
            .delete()
            .eq("id", permissionId);
        if (permError)
            throw permError;
    }
    /**
     * Lấy roles của admin
     */
    async getAdminRoles(adminAccountId) {
        const { data, error } = await supabase_1.supabase
            .from("admin_roles")
            .select(`
        role_id,
        roles (
          id,
          name,
          description
        )
      `)
            .eq("admin_account_id", adminAccountId);
        if (error)
            throw error;
        return (data ?? []).map((ar) => ar.roles).filter(Boolean);
    }
    /**
     * Xóa admin roles
     */
    async deleteAdminRoles(adminAccountId) {
        const { error } = await supabase_1.supabase
            .from("admin_roles")
            .delete()
            .eq("admin_account_id", adminAccountId);
        if (error)
            throw error;
    }
    /**
     * Thêm admin roles
     */
    async addAdminRoles(adminAccountId, roleIds) {
        if (roleIds.length === 0)
            return;
        const adminRoles = roleIds.map((role_id) => ({
            admin_account_id: adminAccountId,
            role_id,
        }));
        const { error } = await supabase_1.supabase.from("admin_roles").insert(adminRoles);
        if (error)
            throw error;
    }
};
exports.PermissionRepository = PermissionRepository;
exports.PermissionRepository = PermissionRepository = __decorate([
    (0, tsyringe_1.injectable)()
], PermissionRepository);
//# sourceMappingURL=PermissionRepository.js.map