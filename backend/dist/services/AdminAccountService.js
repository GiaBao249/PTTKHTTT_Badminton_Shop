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
exports.AdminAccountService = void 0;
const tsyringe_1 = require("tsyringe");
const AdminAccountRepository_1 = require("../repositories/AdminAccountRepository");
const errorHandler_1 = require("../middleware/errorHandler");
let AdminAccountService = class AdminAccountService {
    constructor(adminAccountRepo) {
        this.adminAccountRepo = adminAccountRepo;
    }
    async getAllAdminAccounts() {
        const accounts = await this.adminAccountRepo.findAll();
        return accounts.map((account) => ({
            id: account.id,
            username: account.username,
            employee_id: account.employee_id,
            employee: {
                name: account.employees?.name || "",
            },
        }));
    }
    async getAdminAccountById(accountId) {
        const account = await this.adminAccountRepo.findById(accountId);
        if (!account) {
            throw new errorHandler_1.AppError(404, "Không tìm thấy tài khoản admin", "ADMIN_ACCOUNT_NOT_FOUND");
        }
        return {
            id: account.id,
            username: account.username,
            employee_id: account.employee_id,
            employee: {
                name: account.employees?.name || "",
            },
        };
    }
};
exports.AdminAccountService = AdminAccountService;
exports.AdminAccountService = AdminAccountService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(AdminAccountRepository_1.AdminAccountRepository)),
    __metadata("design:paramtypes", [AdminAccountRepository_1.AdminAccountRepository])
], AdminAccountService);
//# sourceMappingURL=AdminAccountService.js.map