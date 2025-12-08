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
exports.MyOrderController = void 0;
const tsyringe_1 = require("tsyringe");
const MyOrderService_1 = require("../services/MyOrderService");
const errorHandler_1 = require("../middleware/errorHandler");
let MyOrderController = class MyOrderController {
    constructor(myOrderService) {
        this.myOrderService = myOrderService;
        /**
         * GET /api/orders/customer/:id
         * Lấy orders của customer
         */
        this.getMyOrders = async (req, res) => {
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
                const orders = await this.myOrderService.getMyOrders(customerId);
                res.json(orders);
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    res.status(error.statusCode).json({
                        error: error.message,
                        code: error.code,
                    });
                }
                else {
                    console.error("Lỗi khi lấy đơn hàng:", error);
                    res.status(500).json({ error: "Lỗi server" });
                }
            }
        };
    }
};
exports.MyOrderController = MyOrderController;
exports.MyOrderController = MyOrderController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(MyOrderService_1.MyOrderService)),
    __metadata("design:paramtypes", [MyOrderService_1.MyOrderService])
], MyOrderController);
//# sourceMappingURL=MyOrderController.js.map