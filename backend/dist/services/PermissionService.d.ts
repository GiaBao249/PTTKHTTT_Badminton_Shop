import { PermissionRepository } from "../repositories/PermissionRepository";
import { GetPermissionsResponse, Role, Permission, CreateRoleDto, UpdateRoleDto, CreatePermissionDto, UpdatePermissionDto } from "../models/Permission";
export declare class PermissionService {
    private permissionRepo;
    constructor(permissionRepo: PermissionRepository);
    /**
     * Lấy permissions của admin hiện tại
     */
    getPermissions(userId: number): Promise<GetPermissionsResponse>;
    /**
     * Lấy tất cả roles với permissions
     */
    getAllRoles(): Promise<Role[]>;
    /**
     * Tạo role mới
     */
    createRole(createDto: CreateRoleDto): Promise<Role>;
    /**
     * Cập nhật role
     */
    updateRole(roleId: number, updateDto: UpdateRoleDto): Promise<void>;
    /**
     * Xóa role
     */
    deleteRole(roleId: number): Promise<void>;
    /**
     * Lấy tất cả permissions
     */
    getAllPermissions(): Promise<Permission[]>;
    /**
     * Tạo permission mới
     */
    createPermission(createDto: CreatePermissionDto): Promise<Permission>;
    /**
     * Cập nhật permission
     */
    updatePermission(permissionId: number, updateDto: UpdatePermissionDto): Promise<void>;
    /**
     * Xóa permission
     */
    deletePermission(permissionId: number): Promise<void>;
    /**
     * Lấy roles của admin
     */
    getAdminRoles(adminAccountId: number): Promise<Role[]>;
    /**
     * Gán roles cho admin
     */
    assignRolesToAdmin(adminAccountId: number, roleIds: number[]): Promise<void>;
}
//# sourceMappingURL=PermissionService.d.ts.map