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
exports.SupplierController = void 0;
const tsyringe_1 = require("tsyringe");
const SupplierService_1 = require("../services/SupplierService");
const errorHandler_1 = require("../middleware/errorHandler");
let SupplierController = class SupplierController {
    constructor(supplierService) {
        this.supplierService = supplierService;
        this.getAllSuppliers = async (req, res) => {
            try {
                const suppliers = await this.supplierService.getAllSuppliers();
                res.json(suppliers);
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    res
                        .status(error.statusCode)
                        .json({ error: error.message, code: error.code });
                }
                else {
                    console.error("Error getting suppliers:", error);
                    res.status(500).json({ error: "Lỗi server khi lấy nhà cung cấp" });
                }
            }
        };
        this.getSupplierById = async (req, res) => {
            try {
                const supplierId = parseInt(req.params.id || "0");
                if (isNaN(supplierId)) {
                    res.status(400).json({ error: "Invalid supplier Id" });
                    return;
                }
                const supplier = await this.supplierService.getSupplierById(supplierId);
                res.json(supplier);
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    res
                        .status(error.statusCode)
                        .json({ error: error.message, code: error.code });
                }
                else {
                    console.error("Error getting supplier:", error);
                    res.status(500).json({ error: "Lỗi server khi lấy nhà cung cấp" });
                }
            }
        };
    }
};
exports.SupplierController = SupplierController;
exports.SupplierController = SupplierController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(SupplierService_1.SupplierService)),
    __metadata("design:paramtypes", [SupplierService_1.SupplierService])
], SupplierController);
//# sourceMappingURL=SupplierController.js.map