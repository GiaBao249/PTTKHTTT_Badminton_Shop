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
exports.EmployeeService = void 0;
const tsyringe_1 = require("tsyringe");
const EmployeeRepository_1 = require("../repositories/EmployeeRepository");
const errorHandler_1 = require("../middleware/errorHandler");
let EmployeeService = class EmployeeService {
    constructor(employeeRepo) {
        this.employeeRepo = employeeRepo;
    }
    async getAllEmployees() {
        const employees = await this.employeeRepo.findAll();
        return employees.map((emp) => ({
            ...emp,
            employee_id: emp.employ_id,
        }));
    }
    async getEmployeeById(employeeId) {
        const employee = await this.employeeRepo.findById(employeeId);
        if (!employee) {
            throw new errorHandler_1.AppError(404, "Không tìm thấy nhân viên", "EMPLOYEE_NOT_FOUND");
        }
        return {
            ...employee,
            employee_id: employee.employ_id,
        };
    }
};
exports.EmployeeService = EmployeeService;
exports.EmployeeService = EmployeeService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(EmployeeRepository_1.EmployeeRepository)),
    __metadata("design:paramtypes", [EmployeeRepository_1.EmployeeRepository])
], EmployeeService);
//# sourceMappingURL=EmployeeService.js.map