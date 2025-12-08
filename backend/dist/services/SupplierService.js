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
exports.SupplierService = void 0;
const tsyringe_1 = require("tsyringe");
const SupplierRepository_1 = require("../repositories/SupplierRepository");
const errorHandler_1 = require("../middleware/errorHandler");
let SupplierService = class SupplierService {
    constructor(supplierRepo) {
        this.supplierRepo = supplierRepo;
    }
    async getAllSuppliers() {
        return await this.supplierRepo.findAll();
    }
    async getSupplierById(supplierId) {
        const supplier = await this.supplierRepo.findById(supplierId);
        if (!supplier) {
            throw new errorHandler_1.AppError(404, "Không tìm thấy nhà cung cấp", "SUPPLIER_NOT_FOUND");
        }
        return supplier;
    }
};
exports.SupplierService = SupplierService;
exports.SupplierService = SupplierService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(SupplierRepository_1.SupplierRepository)),
    __metadata("design:paramtypes", [SupplierRepository_1.SupplierRepository])
], SupplierService);
//# sourceMappingURL=SupplierService.js.map