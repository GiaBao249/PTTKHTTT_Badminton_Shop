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
exports.StatisticsController = void 0;
// controllers/StatisticsController.ts
const tsyringe_1 = require("tsyringe");
const StatisticsService_1 = require("../services/StatisticsService");
const errorHandler_1 = require("../middleware/errorHandler");
let StatisticsController = class StatisticsController {
    constructor(statisticsService) {
        this.statisticsService = statisticsService;
        /**
         * GET /api/admin/statistics/revenue?period=month
         */
        this.getRevenueStatistics = async (req, res) => {
            try {
                const period = req.query.period || "month";
                const stats = await this.statisticsService.getRevenueStatistics(period);
                res.json(stats);
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    res
                        .status(error.statusCode)
                        .json({ error: error.message, code: error.code });
                }
                else {
                    console.error("Error getting revenue statistics:", error);
                    res.status(500).json({ error: "Lỗi khi lấy thống kê doanh thu" });
                }
            }
        };
        /**
         * GET /api/admin/statistics/products
         */
        this.getProductStatistics = async (req, res) => {
            try {
                const stats = await this.statisticsService.getProductStatistics();
                res.json(stats);
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    res
                        .status(error.statusCode)
                        .json({ error: error.message, code: error.code });
                }
                else {
                    console.error("Error getting product statistics:", error);
                    res.status(500).json({ error: "Lỗi khi lấy thống kê sản phẩm" });
                }
            }
        };
        /**
         * GET /api/admin/statistics/orders
         */
        this.getOrderStatistics = async (req, res) => {
            try {
                const stats = await this.statisticsService.getOrderStatistics();
                res.json(stats);
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    res
                        .status(error.statusCode)
                        .json({ error: error.message, code: error.code });
                }
                else {
                    console.error("Error getting order statistics:", error);
                    res.status(500).json({ error: "Lỗi khi lấy thống kê đơn hàng" });
                }
            }
        };
        /**
         * GET /api/admin/statistics/summary?startDate=&endDate=
         */
        this.getSummaryStatistics = async (req, res) => {
            try {
                const startDate = req.query.startDate;
                const endDate = req.query.endDate;
                const stats = await this.statisticsService.getSummaryStatistics(startDate, endDate);
                res.json(stats);
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    res
                        .status(error.statusCode)
                        .json({ error: error.message, code: error.code });
                }
                else {
                    console.error("Error getting summary statistics:", error);
                    res.status(500).json({ error: "Lỗi khi lấy thống kê tổng hợp" });
                }
            }
        };
    }
};
exports.StatisticsController = StatisticsController;
exports.StatisticsController = StatisticsController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(StatisticsService_1.StatisticsService)),
    __metadata("design:paramtypes", [StatisticsService_1.StatisticsService])
], StatisticsController);
//# sourceMappingURL=StatisticsController.js.map