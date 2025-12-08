import { Permission, Role } from "../models/Permission";
export declare class PermissionRepository {
    getAdminAccountId(userId: number): Promise<number | null>;
    getAdminRoleIds(adminAccountId: number): Promise<number[]>;
    getRolesByIds(roleIds: number[]): Promise<Role[]>;
    getRolePermissionsByRoleIds(roleIds: number[]): Promise<Map<number, number[]>>;
    getPermissionsByIds(permissionIds: number[]): Promise<Permission[]>;
    getAllRolesWithPermissions(): Promise<Role[]>;
    /**
     * Tạo role mới
     */
    createRole(name: string, description?: string): Promise<Role>;
    /**
     * Thêm role permissions
     */
    addRolePermissions(roleId: number, permissionIds: number[]): Promise<void>;
    /**
     * Xóa role permissions
     */
    deleteRolePermissions(roleId: number): Promise<void>;
    /**
     * Cập nhật role
     */
    updateRole(roleId: number, updateData: {
        name?: string;
        description?: string;
    }): Promise<void>;
    /**
     * Xóa role (cascade delete)
     */
    deleteRole(roleId: number): Promise<void>;
    /**
     * Lấy tất cả permissions
     */
    getAllPermissions(): Promise<Permission[]>;
    /**
     * Tạo permission mới
     */
    createPermission(code: string, name: string, module?: string): Promise<Permission>;
    /**
     * Cập nhật permission
     */
    updatePermission(permissionId: number, updateData: {
        code?: string;
        name?: string;
        module?: string;
    }): Promise<void>;
    /**
     * Xóa permission (cascade delete)
     */
    deletePermission(permissionId: number): Promise<void>;
    /**
     * Lấy roles của admin
     */
    getAdminRoles(adminAccountId: number): Promise<Role[]>;
    /**
     * Xóa admin roles
     */
    deleteAdminRoles(adminAccountId: number): Promise<void>;
    /**
     * Thêm admin roles
     */
    addAdminRoles(adminAccountId: number, roleIds: number[]): Promise<void>;
}
//# sourceMappingURL=PermissionRepository.d.ts.map