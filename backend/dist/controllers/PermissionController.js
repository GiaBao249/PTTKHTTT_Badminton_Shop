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
exports.PermissionController = void 0;
const tsyringe_1 = require("tsyringe");
const PermissionService_1 = require("../services/PermissionService");
const errorHandler_1 = require("../middleware/errorHandler");
let PermissionController = class PermissionController {
    constructor(permissionService) {
        this.permissionService = permissionService;
        /**
         * GET /api/admin/getPermissions
         * Lấy permissions của admin hiện tại (GIỮ NGUYÊN endpoint cho frontend)
         * Đặc biệt: không cần requireAdminRole
         */
        this.getPermissions = async (req, res) => {
            try {
                const user = req.user;
                if (!user || user.role !== "admin") {
                    res.status(403).json({ error: "Access denied. Admin role required." });
                    return;
                }
                const result = await this.permissionService.getPermissions(user.id);
                res.json(result);
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    res
                        .status(error.statusCode)
                        .json({ error: error.message, code: error.code });
                }
                else {
                    console.error("Error getting permissions:", error);
                    res.status(500).json({ error: "Lỗi server khi lấy quyền" });
                }
            }
        };
        /**
         * GET /api/admin/roles
         * Lấy tất cả roles (GIỮ NGUYÊN endpoint cho frontend)
         */
        this.getAllRoles = async (req, res) => {
            try {
                const roles = await this.permissionService.getAllRoles();
                res.json(roles);
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    res
                        .status(error.statusCode)
                        .json({ error: error.message, code: error.code });
                }
                else {
                    console.error("Error fetching roles:", error);
                    res.status(500).json({ error: "Lỗi khi lấy danh sách roles" });
                }
            }
        };
        /**
         * POST /api/admin/roles
         * Tạo role mới (GIỮ NGUYÊN endpoint cho frontend)
         */
        this.createRole = async (req, res) => {
            try {
                const createDto = req.body;
                const role = await this.permissionService.createRole(createDto);
                res.status(201).json({ success: true, role });
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    res
                        .status(error.statusCode)
                        .json({ error: error.message, code: error.code });
                }
                else {
                    console.error("Error creating role:", error);
                    res.status(500).json({ error: "Lỗi khi tạo role" });
                }
            }
        };
        /**
         * PUT /api/admin/roles/:id
         * Cập nhật role (GIỮ NGUYÊN endpoint cho frontend)
         */
        this.updateRole = async (req, res) => {
            try {
                const roleId = parseInt(req.params.id || "0");
                if (isNaN(roleId)) {
                    res.status(400).json({ error: "Invalid role ID" });
                    return;
                }
                const updateDto = req.body;
                await this.permissionService.updateRole(roleId, updateDto);
                res.json({ success: true });
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    res
                        .status(error.statusCode)
                        .json({ error: error.message, code: error.code });
                }
                else {
                    console.error("Error updating role:", error);
                    res.status(500).json({ error: "Lỗi khi cập nhật role" });
                }
            }
        };
        /**
         * DELETE /api/admin/roles/:id
         * Xóa role (GIỮ NGUYÊN endpoint cho frontend)
         */
        this.deleteRole = async (req, res) => {
            try {
                const roleId = parseInt(req.params.id || "0");
                if (isNaN(roleId)) {
                    res.status(400).json({ error: "Invalid role ID" });
                    return;
                }
                await this.permissionService.deleteRole(roleId);
                res.json({ success: true });
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    res
                        .status(error.statusCode)
                        .json({ error: error.message, code: error.code });
                }
                else {
                    console.error("Error deleting role:", error);
                    res.status(500).json({ error: "Lỗi khi xóa role" });
                }
            }
        };
        /**
         * GET /api/admin/permissions
         * Lấy tất cả permissions (GIỮ NGUYÊN endpoint cho frontend)
         */
        this.getAllPermissions = async (req, res) => {
            try {
                const permissions = await this.permissionService.getAllPermissions();
                res.json(permissions);
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    res
                        .status(error.statusCode)
                        .json({ error: error.message, code: error.code });
                }
                else {
                    console.error("Error fetching permissions:", error);
                    res.status(500).json({ error: "Lỗi khi lấy danh sách permissions" });
                }
            }
        };
        /**
         * POST /api/admin/permissions
         * Tạo permission mới (GIỮ NGUYÊN endpoint cho frontend)
         */
        this.createPermission = async (req, res) => {
            try {
                const createDto = req.body;
                const permission = await this.permissionService.createPermission(createDto);
                res.status(201).json({ success: true, permission });
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    res
                        .status(error.statusCode)
                        .json({ error: error.message, code: error.code });
                }
                else {
                    console.error("Error creating permission:", error);
                    res.status(500).json({ error: "Lỗi khi tạo permission" });
                }
            }
        };
        /**
         * PUT /api/admin/permissions/:id
         * Cập nhật permission (GIỮ NGUYÊN endpoint cho frontend)
         */
        this.updatePermission = async (req, res) => {
            try {
                const permissionId = parseInt(req.params.id || "0");
                if (isNaN(permissionId)) {
                    res.status(400).json({ error: "Invalid permission ID" });
                    return;
                }
                const updateDto = req.body;
                await this.permissionService.updatePermission(permissionId, updateDto);
                res.json({ success: true });
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    res
                        .status(error.statusCode)
                        .json({ error: error.message, code: error.code });
                }
                else {
                    console.error("Error updating permission:", error);
                    res.status(500).json({ error: "Lỗi khi cập nhật permission" });
                }
            }
        };
        /**
         * DELETE /api/admin/permissions/:id
         * Xóa permission (GIỮ NGUYÊN endpoint cho frontend)
         */
        this.deletePermission = async (req, res) => {
            try {
                const permissionId = parseInt(req.params.id || "0");
                if (isNaN(permissionId)) {
                    res.status(400).json({ error: "Invalid permission ID" });
                    return;
                }
                await this.permissionService.deletePermission(permissionId);
                res.json({ success: true });
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    res
                        .status(error.statusCode)
                        .json({ error: error.message, code: error.code });
                }
                else {
                    console.error("Error deleting permission:", error);
                    res.status(500).json({ error: "Lỗi khi xóa permission" });
                }
            }
        };
        /**
         * GET /api/admin/admin/:adminId/roles
         * Lấy roles của admin (GIỮ NGUYÊN endpoint cho frontend)
         */
        this.getAdminRoles = async (req, res) => {
            try {
                const adminId = parseInt(req.params.adminId || "0");
                if (isNaN(adminId)) {
                    res.status(400).json({ error: "Invalid admin ID" });
                    return;
                }
                const roles = await this.permissionService.getAdminRoles(adminId);
                res.json(roles);
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    res
                        .status(error.statusCode)
                        .json({ error: error.message, code: error.code });
                }
                else {
                    console.error("Error fetching admin roles:", error);
                    res.status(500).json({ error: "Lỗi khi lấy roles của admin" });
                }
            }
        };
        /**
         * POST /api/admin/admin/:adminId/roles
         * Gán roles cho admin (GIỮ NGUYÊN endpoint cho frontend)
         */
        this.assignRolesToAdmin = async (req, res) => {
            try {
                const adminId = parseInt(req.params.adminId || "0");
                if (isNaN(adminId)) {
                    res.status(400).json({ error: "Invalid admin ID" });
                    return;
                }
                const { role_ids } = req.body;
                await this.permissionService.assignRolesToAdmin(adminId, role_ids);
                res.json({ success: true });
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    res
                        .status(error.statusCode)
                        .json({ error: error.message, code: error.code });
                }
                else {
                    console.error("Error assigning roles to admin:", error);
                    res.status(500).json({ error: "Lỗi khi gán roles cho admin" });
                }
            }
        };
    }
};
exports.PermissionController = PermissionController;
exports.PermissionController = PermissionController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(PermissionService_1.PermissionService)),
    __metadata("design:paramtypes", [PermissionService_1.PermissionService])
], PermissionController);
//# sourceMappingURL=PermissionController.js.map