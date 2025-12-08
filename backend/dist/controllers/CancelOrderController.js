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
exports.CancelOrderController = void 0;
const tsyringe_1 = require("tsyringe");
const CancelOrderService_1 = require("../services/CancelOrderService");
const errorHandler_1 = require("../middleware/errorHandler");
let CancelOrderController = class CancelOrderController {
    constructor(cancelOrderService) {
        this.cancelOrderService = cancelOrderService;
        /**
         * PATCH /api/orders/cancel/:orderId
         * Hủy đơn hàng
         */
        this.cancelOrder = async (req, res) => {
            try {
                const orderId = parseInt(req.params.orderId);
                const user = req.user;
                if (!orderId || isNaN(orderId)) {
                    res.status(400).json({ error: "Invalid order ID" });
                    return;
                }
                if (!user || user.role !== "user") {
                    res
                        .status(403)
                        .json({ error: "Chỉ khách hàng mới có thể hủy đơn hàng" });
                    return;
                }
                const result = await this.cancelOrderService.cancelOrder(orderId, user.id);
                console.log("đơn hàng bị hủy bởi khách hàng:", result.order);
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
                    console.error("Server error:", error);
                    res.status(500).json({ error: "Lỗi máy chủ" });
                }
            }
        };
    }
};
exports.CancelOrderController = CancelOrderController;
exports.CancelOrderController = CancelOrderController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(CancelOrderService_1.CancelOrderService)),
    __metadata("design:paramtypes", [CancelOrderService_1.CancelOrderService])
], CancelOrderController);
//# sourceMappingURL=CancelOrderController.js.map