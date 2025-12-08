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
exports.CustomerController = void 0;
const tsyringe_1 = require("tsyringe");
const CustomerService_1 = require("../services/CustomerService");
const errorHandler_1 = require("../middleware/errorHandler");
let CustomerController = class CustomerController {
    constructor(customerService) {
        this.customerService = customerService;
        this.getAllCustomers = async (req, res) => {
            try {
                const customers = await this.customerService.getAllCustomerWithStats();
                res.json(customers);
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    res
                        .status(error.statusCode)
                        .json({ error: error.message, code: error.code });
                }
                else {
                    console.error("Error getting customers:", error);
                    res
                        .status(500)
                        .json({ error: "Lỗi server khi lấy danh sách khách hàng" });
                }
            }
        };
        this.getCustomerById = async (req, res) => {
            try {
                const customerId = parseInt(req.params.id || "0");
                if (isNaN(customerId)) {
                    res.status(400).json({ error: "Invalid customer ID" });
                    return;
                }
                const customer = await this.customerService.getCustomerByIdWithStats(customerId);
                res.json(customer);
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    res
                        .status(error.statusCode)
                        .json({ error: error.message, code: error.code });
                }
                else {
                    console.error("Error getting customer:", error);
                    res.status(500).json({ error: "Lỗi server khi lấy khách hàng" });
                }
            }
        };
    }
};
exports.CustomerController = CustomerController;
exports.CustomerController = CustomerController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(CustomerService_1.CustomerService)),
    __metadata("design:paramtypes", [CustomerService_1.CustomerService])
], CustomerController);
//# sourceMappingURL=CustomerController.js.map