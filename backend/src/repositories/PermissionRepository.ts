import { injectable } from "tsyringe";
import { supabase } from "../config/supabase";
import { Permission, Role, AdminRole } from "../models/Permission";

@injectable()
export class PermissionRepository {
  async getAdminAccountId(userId: number): Promise<number | null> {
    const { data: adminRoles, error } = await supabase
      .from("admin_roles")
      .select("admin_account_id")
      .eq("admin_account_id", userId)
      .limit(1);
    if (!error && adminRoles && adminRoles.length > 0) {
      return userId;
    }
    const { data: adminAccount, error: accountError } = await supabase
      .from("adminaccounts")
      .select("id")
      .eq("employee_id", userId)
      .single();
    if (!accountError && adminAccount) {
      return adminAccount.id;
    }
    return null;
  }
  async getAdminRoleIds(adminAccountId: number): Promise<number[]> {
    const { data, error } = await supabase
      .from("admin_roles")
      .select("role_id")
      .eq("admin_account_id", adminAccountId);

    if (error) throw error;
    return (data ?? []).map((ar: any) => ar.role_id).filter(Boolean);
  }
  async getRolesByIds(roleIds: number[]): Promise<Role[]> {
    if (roleIds.length === 0) return [];

    const { data, error } = await supabase
      .from("roles")
      .select("id, name, description")
      .in("id", roleIds);

    if (error) throw error;
    return data ?? [];
  }
  async getRolePermissionsByRoleIds(
    roleIds: number[]
  ): Promise<Map<number, number[]>> {
    if (roleIds.length === 0) return new Map();

    const { data, error } = await supabase
      .from("role_permissions")
      .select("role_id, permission_id")
      .in("role_id", roleIds);

    if (error) throw error;

    const rolePermMap = new Map<number, number[]>();
    (data ?? []).forEach((rp: any) => {
      if (!rolePermMap.has(rp.role_id)) {
        rolePermMap.set(rp.role_id, []);
      }
      rolePermMap.get(rp.role_id)!.push(rp.permission_id);
    });

    return rolePermMap;
  }
  async getPermissionsByIds(permissionIds: number[]): Promise<Permission[]> {
    if (permissionIds.length === 0) return [];

    const { data, error } = await supabase
      .from("permissions")
      .select("id, code, name, module")
      .in("id", permissionIds);

    if (error) throw error;
    return data ?? [];
  }
  async getAllRolesWithPermissions(): Promise<Role[]> {
    const { data, error } = await supabase
      .from("roles")
      .select(
        `
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
      `
      )
      .order("id", { ascending: true });

    if (error) throw error;

    // Format lại data
    return (data ?? []).map((role: any) => ({
      id: role.id,
      name: role.name,
      description: role.description,
      permissions: Array.isArray(role.role_permissions)
        ? role.role_permissions.map((rp: any) => rp.permissions).filter(Boolean)
        : role.role_permissions?.permissions
        ? [role.role_permissions.permissions]
        : [],
    }));
  }

  /**
   * Tạo role mới
   */
  async createRole(name: string, description?: string): Promise<Role> {
    const { data, error } = await supabase
      .from("roles")
      .insert([{ name, description: description || "" }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Thêm role permissions
   */
  async addRolePermissions(
    roleId: number,
    permissionIds: number[]
  ): Promise<void> {
    if (permissionIds.length === 0) return;

    const rolePermissions = permissionIds.map((permission_id) => ({
      role_id: roleId,
      permission_id,
    }));

    const { error } = await supabase
      .from("role_permissions")
      .insert(rolePermissions);

    if (error) throw error;
  }

  /**
   * Xóa role permissions
   */
  async deleteRolePermissions(roleId: number): Promise<void> {
    const { error } = await supabase
      .from("role_permissions")
      .delete()
      .eq("role_id", roleId);

    if (error) throw error;
  }

  /**
   * Cập nhật role
   */
  async updateRole(
    roleId: number,
    updateData: { name?: string; description?: string }
  ): Promise<void> {
    const { error } = await supabase
      .from("roles")
      .update(updateData)
      .eq("id", roleId);

    if (error) throw error;
  }

  /**
   * Xóa role (cascade delete)
   */
  async deleteRole(roleId: number): Promise<void> {
    // Xóa role_permissions trước
    await this.deleteRolePermissions(roleId);

    // Xóa admin_roles
    const { error: arError } = await supabase
      .from("admin_roles")
      .delete()
      .eq("role_id", roleId);

    if (arError) throw arError;

    // Xóa role
    const { error: roleError } = await supabase
      .from("roles")
      .delete()
      .eq("id", roleId);

    if (roleError) throw roleError;
  }

  /**
   * Lấy tất cả permissions
   */
  async getAllPermissions(): Promise<Permission[]> {
    const { data, error } = await supabase
      .from("permissions")
      .select("*")
      .order("module", { ascending: true })
      .order("code", { ascending: true });

    if (error) throw error;
    return data ?? [];
  }

  /**
   * Tạo permission mới
   */
  async createPermission(
    code: string,
    name: string,
    module?: string
  ): Promise<Permission> {
    const { data, error } = await supabase
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
  async updatePermission(
    permissionId: number,
    updateData: { code?: string; name?: string; module?: string }
  ): Promise<void> {
    const { error } = await supabase
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
  async deletePermission(permissionId: number): Promise<void> {
    // Xóa role_permissions trước
    const { error: rpError } = await supabase
      .from("role_permissions")
      .delete()
      .eq("permission_id", permissionId);

    if (rpError) throw rpError;

    // Xóa permission
    const { error: permError } = await supabase
      .from("permissions")
      .delete()
      .eq("id", permissionId);

    if (permError) throw permError;
  }

  /**
   * Lấy roles của admin
   */
  async getAdminRoles(adminAccountId: number): Promise<Role[]> {
    const { data, error } = await supabase
      .from("admin_roles")
      .select(
        `
        role_id,
        roles (
          id,
          name,
          description
        )
      `
      )
      .eq("admin_account_id", adminAccountId);

    if (error) throw error;
    return (data ?? []).map((ar: any) => ar.roles).filter(Boolean);
  }

  /**
   * Xóa admin roles
   */
  async deleteAdminRoles(adminAccountId: number): Promise<void> {
    const { error } = await supabase
      .from("admin_roles")
      .delete()
      .eq("admin_account_id", adminAccountId);

    if (error) throw error;
  }

  /**
   * Thêm admin roles
   */
  async addAdminRoles(
    adminAccountId: number,
    roleIds: number[]
  ): Promise<void> {
    if (roleIds.length === 0) return;

    const adminRoles = roleIds.map((role_id) => ({
      admin_account_id: adminAccountId,
      role_id,
    }));

    const { error } = await supabase.from("admin_roles").insert(adminRoles);

    if (error) throw error;
  }
}
