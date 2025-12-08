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
exports.InvoiceController = void 0;
const InvoiceService_1 = require("../services/InvoiceService");
const errorHandler_1 = require("../middleware/errorHandler");
const tsyringe_1 = require("tsyringe");
let InvoiceController = class InvoiceController {
    constructor(invoiceService) {
        this.invoiceService = invoiceService;
        this.getInvoices = async (req, res) => {
            try {
                const filters = {
                    startDate: req.query.startDate,
                    endDate: req.query.endDate,
                    status: req.query.status,
                };
                const invoices = await this.invoiceService.getInvoices(filters);
                res.json(invoices);
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    res
                        .status(error.statusCode)
                        .json({ error: error.message, code: error.code });
                }
                else {
                    console.error("Error getting invoices:", error);
                    res.status(500).json({ error: "Lỗi khi lấy hóa đơn" });
                }
            }
        };
        this.getInvoiceByOrderId = async (req, res) => {
            try {
                const orderId = parseInt(req.params.orderId || "0");
                if (isNaN(orderId)) {
                    res.status(400).json({ error: "Invalid order ID" });
                    return;
                }
                const user = req.user;
                const invoice = await this.invoiceService.getInvoiceByOrderId(orderId, user?.id, user?.role);
                res.json(invoice);
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    res
                        .status(error.statusCode)
                        .json({ error: error.message, code: error.code });
                }
                else {
                    console.error("Error getting invoice:", error);
                    res.status(500).json({ error: "Lỗi khi lấy hóa đơn" });
                }
            }
        };
    }
};
exports.InvoiceController = InvoiceController;
exports.InvoiceController = InvoiceController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(InvoiceService_1.InvoiceService)),
    __metadata("design:paramtypes", [InvoiceService_1.InvoiceService])
], InvoiceController);
//# sourceMappingURL=InvoiceController.js.map