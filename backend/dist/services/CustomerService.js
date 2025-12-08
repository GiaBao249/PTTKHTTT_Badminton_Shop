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
exports.CustomerService = void 0;
const tsyringe_1 = require("tsyringe");
const CustomerRepository_1 = require("../repositories/CustomerRepository");
const errorHandler_1 = require("../middleware/errorHandler");
let CustomerService = class CustomerService {
    constructor(customerRepo) {
        this.customerRepo = customerRepo;
    }
    async getAllCustomerWithStats() {
        const [customers, statsMap] = await Promise.all([
            this.customerRepo.findAll(),
            this.customerRepo.getOrdersStats(),
        ]);
        return customers.map((customer) => {
            const stats = statsMap.get(customer.customer_id) || {
                total_orders: 0,
                total_spent: 0,
            };
            return {
                ...customer,
                total_orders: stats.total_orders,
                total_spent: stats.total_spent,
            };
        });
    }
    async getCustomerByIdWithStats(customerId) {
        const customer = await this.customerRepo.findById(customerId);
        if (!customer) {
            throw new errorHandler_1.AppError(404, "Không tìm thấy khách hàng", "CUSTOMER_NOT_FOUND");
        }
        const statsMap = await this.customerRepo.getOrdersStats();
        const stats = statsMap.get(customerId) || {
            total_orders: 0,
            total_spent: 0,
        };
        return {
            ...customer,
            total_orders: stats.total_orders,
            total_spent: stats.total_spent,
        };
    }
};
exports.CustomerService = CustomerService;
exports.CustomerService = CustomerService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(CustomerRepository_1.CustomerRepository)),
    __metadata("design:paramtypes", [CustomerRepository_1.CustomerRepository])
], CustomerService);
//# sourceMappingURL=CustomerService.js.map