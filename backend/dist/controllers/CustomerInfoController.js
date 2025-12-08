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
exports.CustomerInfoController = void 0;
const tsyringe_1 = require("tsyringe");
const CustomerInfoService_1 = require("../services/CustomerInfoService");
const errorHandler_1 = require("../middleware/errorHandler");
let CustomerInfoController = class CustomerInfoController {
    constructor(customerInfoService) {
        this.customerInfoService = customerInfoService;
        /**
         * GET /api/info/:id
         * Lấy customer info với addresses
         */
        this.getCustomerInfo = async (req, res) => {
            try {
                const idParam = req.params.id;
                if (!idParam) {
                    res.status(400).json({ error: "Customer ID is required" });
                    return;
                }
                const customerId = parseInt(idParam, 10);
                if (isNaN(customerId)) {
                    res.status(400).json({ error: "Invalid customer ID" });
                    return;
                }
                const user = req.user;
                if (user.role === "user" && user.id !== customerId) {
                    res.status(403).json({ error: "không có quyền truy cập" });
                    return;
                }
                const customerInfo = await this.customerInfoService.getCustomerInfo(customerId);
                res.json(customerInfo);
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    res.status(error.statusCode).json({
                        error: error.message,
                        code: error.code,
                    });
                }
                else {
                    console.error("Error getting customer info:", error);
                    res.status(500).json({
                        error: error.message || "Lỗi server",
                    });
                }
            }
        };
        /**
         * PUT /api/info/:id
         * Cập nhật customer info
         */
        this.updateCustomer = async (req, res) => {
            try {
                const idParam = req.params.id;
                if (!idParam) {
                    res.status(400).json({ error: "Customer ID is required" });
                    return;
                }
                const customerId = parseInt(idParam, 10);
                if (isNaN(customerId)) {
                    res.status(400).json({ error: "Invalid customer ID" });
                    return;
                }
                const user = req.user;
                if (user.role !== "user" || user.id !== customerId) {
                    res.status(403).json({ error: "Không có quyền truy cập" });
                    return;
                }
                const updateDto = req.body;
                const result = await this.customerInfoService.updateCustomer(customerId, updateDto);
                res.json(result);
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    res.status(error.statusCode).json({
                        error: error.message,
                        code: error.code,
                    });
                }
                else {
                    console.error("Error updating customer:", error);
                    res.status(500).json({
                        error: error.message || "Lỗi server",
                    });
                }
            }
        };
        /**
         * PUT /api/info/:id/password
         * Đổi password
         */
        this.updatePassword = async (req, res) => {
            try {
                const idParam = req.params.id;
                if (!idParam) {
                    res.status(400).json({ error: "Customer ID is required" });
                    return;
                }
                const customerId = parseInt(idParam, 10);
                if (isNaN(customerId)) {
                    res.status(400).json({ error: "Invalid customer ID" });
                    return;
                }
                const user = req.user;
                if (user.role === "user" && Number(user.id) !== customerId) {
                    res.status(403).json({ error: "Không có quyền truy cập" });
                    return;
                }
                const updatePasswordDto = req.body;
                await this.customerInfoService.updatePassword(customerId, updatePasswordDto);
                res.json({ message: "Đổi mật khẩu thành công" });
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    res.status(error.statusCode).json({
                        error: error.message,
                        code: error.code,
                    });
                }
                else {
                    console.error("Error updating password:", error);
                    res.status(500).json({
                        error: error.message || "Lỗi server",
                    });
                }
            }
        };
        /**
         * POST /api/info/:id/address
         * Tạo address mới
         */
        this.createAddress = async (req, res) => {
            try {
                const idParam = req.params.id;
                if (!idParam) {
                    res.status(400).json({ error: "Customer ID is required" });
                    return;
                }
                const customerId = parseInt(idParam, 10);
                if (isNaN(customerId)) {
                    res.status(400).json({ error: "Invalid customer ID" });
                    return;
                }
                const user = req.user;
                if (user.role === "user" && Number(user.id) !== customerId) {
                    res.status(403).json({ error: "Không có quyền truy cập" });
                    return;
                }
                const addressData = req.body;
                const result = await this.customerInfoService.createAddress(customerId, addressData);
                res.status(201).json(result);
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    res.status(error.statusCode).json({
                        error: error.message,
                        code: error.code,
                    });
                }
                else {
                    console.error("Error creating address:", error);
                    res.status(500).json({
                        error: error.message || "Lỗi server",
                    });
                }
            }
        };
        /**
         * PUT /api/info/:id/address/:addressId
         * Cập nhật address
         */
        this.updateAddress = async (req, res) => {
            try {
                const idParam = req.params.id;
                const addressIdParam = req.params.addressId;
                if (!idParam || !addressIdParam) {
                    res
                        .status(400)
                        .json({ error: "Customer ID and Address ID are required" });
                    return;
                }
                const customerId = parseInt(idParam, 10);
                const addressId = parseInt(addressIdParam, 10);
                if (isNaN(customerId) || isNaN(addressId)) {
                    res.status(400).json({ error: "Invalid ID" });
                    return;
                }
                const user = req.user;
                if (user.role === "user" && Number(user.id) !== customerId) {
                    res.status(403).json({ error: "Không có quyền truy cập" });
                    return;
                }
                const updateData = req.body;
                const result = await this.customerInfoService.updateAddress(customerId, addressId, updateData);
                res.json(result);
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    res.status(error.statusCode).json({
                        error: error.message,
                        code: error.code,
                    });
                }
                else {
                    console.error("Error updating address:", error);
                    res.status(500).json({
                        error: error.message || "Lỗi server",
                    });
                }
            }
        };
    }
};
exports.CustomerInfoController = CustomerInfoController;
exports.CustomerInfoController = CustomerInfoController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(CustomerInfoService_1.CustomerInfoService)),
    __metadata("design:paramtypes", [CustomerInfoService_1.CustomerInfoService])
], CustomerInfoController);
//# sourceMappingURL=CustomerInfoController.js.map