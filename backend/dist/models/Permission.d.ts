export interface Permission {
    id: number;
    code: string;
    name: string;
    module?: string;
}
export interface Role {
    id: number;
    name: string;
    description?: string;
    permissions?: Permission[];
}
export interface AdminRole {
    admin_account_id: number;
    role_id: number;
    roles?: Role;
}
export interface GetPermissionsResponse {
    permissions: Permission[];
    roles: Role[];
    permissionCodes: string[];
    hasNoRoles: boolean;
}
export interface CreateRoleDto {
    name: string;
    description?: string;
    permission_ids?: number[];
}
export interface UpdateRoleDto {
    name?: string;
    description?: string;
    permission_ids?: number[];
}
export interface CreatePermissionDto {
    code: string;
    name: string;
    module?: string;
}
export interface UpdatePermissionDto {
    code?: string;
    name?: string;
    module?: string;
}
export interface AssignRolesToAdminDto {
    role_ids: number[];
}
//# sourceMappingURL=Permission.d.ts.map