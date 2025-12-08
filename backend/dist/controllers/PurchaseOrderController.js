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
exports.PurchaseOrderController = void 0;
const tsyringe_1 = require("tsyringe");
const PurchaseOrderService_1 = require("../services/PurchaseOrderService");
const errorHandler_1 = require("../middleware/errorHandler");
let PurchaseOrderController = class PurchaseOrderController {
    constructor(purchaseOrderService) {
        this.purchaseOrderService = purchaseOrderService;
        /**
         * GET /api/admin/getPurchaseOrders
         * Lấy tất cả purchase orders (GIỮ NGUYÊN endpoint cho frontend)
         */
        this.getAllPurchaseOrders = async (req, res) => {
            try {
                const purchaseOrders = await this.purchaseOrderService.getAllPurchaseOrders();
                res.json(purchaseOrders);
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    res
                        .status(error.statusCode)
                        .json({ error: error.message, code: error.code });
                }
                else {
                    console.error("Error getting purchase orders:", error);
                    res.status(500).json({ error: "Lỗi khi lấy danh sách phiếu nhập" });
                }
            }
        };
        /**
         * GET /api/admin/getPurchaseOrderDetail/:id
         * Lấy purchase order detail (GIỮ NGUYÊN endpoint cho frontend)
         */
        this.getPurchaseOrderDetail = async (req, res) => {
            try {
                const purchaseOrderId = parseInt(req.params.id || "0");
                if (isNaN(purchaseOrderId)) {
                    res.status(400).json({ error: "Invalid purchase order ID" });
                    return;
                }
                const purchaseOrder = await this.purchaseOrderService.getPurchaseOrderById(purchaseOrderId);
                res.json(purchaseOrder);
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    res
                        .status(error.statusCode)
                        .json({ error: error.message, code: error.code });
                }
                else {
                    console.error("Error getting purchase order detail:", error);
                    res.status(500).json({ error: error.message || "Lỗi server" });
                }
            }
        };
        /**
         * POST /api/admin/createPurchaseOrder
         * Tạo purchase order mới (GIỮ NGUYÊN endpoint cho frontend)
         */
        this.createPurchaseOrder = async (req, res) => {
            try {
                const createDto = req.body;
                const purchaseOrder = await this.purchaseOrderService.createPurchaseOrder(createDto);
                res.status(201).json({
                    success: true,
                    purchaseOrder,
                    message: "Tạo phiếu nhập thành công",
                });
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    res
                        .status(error.statusCode)
                        .json({ error: error.message, code: error.code });
                }
                else {
                    console.error("Error creating purchase order:", error);
                    res.status(500).json({
                        error: error.message || "Không thể tạo phiếu nhập",
                    });
                }
            }
        };
    }
};
exports.PurchaseOrderController = PurchaseOrderController;
exports.PurchaseOrderController = PurchaseOrderController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(PurchaseOrderService_1.PurchaseOrderService)),
    __metadata("design:paramtypes", [PurchaseOrderService_1.PurchaseOrderService])
], PurchaseOrderController);
//# sourceMappingURL=PurchaseOrderController.js.map