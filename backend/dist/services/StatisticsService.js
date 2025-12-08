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
exports.StatisticsService = void 0;
const tsyringe_1 = require("tsyringe");
const StatisticsRepository_1 = require("../repositories/StatisticsRepository");
let StatisticsService = class StatisticsService {
    constructor(statisticsRepo) {
        this.statisticsRepo = statisticsRepo;
    }
    getPeriodKey(date, period) {
        switch (period) {
            case "day": {
                const dayKey = date.toISOString().split("T")[0];
                return dayKey || "";
            }
            case "week": {
                const weekDate = new Date(date);
                const dayOfWeek = weekDate.getDay();
                const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
                weekDate.setDate(weekDate.getDate() - daysToMonday);
                const year = weekDate.getFullYear();
                const jan1 = new Date(year, 0, 1);
                const jan1Day = jan1.getDay();
                const daysFromJan1 = Math.floor((weekDate.getTime() - jan1.getTime()) / (24 * 60 * 60 * 1000));
                let weekNumber = Math.floor((daysFromJan1 + jan1Day) / 7);
                if (jan1Day > 1)
                    weekNumber += 1;
                return `${year}-W${String(weekNumber).padStart(2, "0")}`;
            }
            case "month":
                return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
            case "year":
                return String(date.getFullYear());
            default:
                return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        }
    }
    async getRevenueStatistics(period = "month") {
        const orders = await this.statisticsRepo.getCompletedOrders();
        const revenueByPeriod = {};
        const orderCountByPeriod = {};
        orders.forEach((order) => {
            if (!order.order_date)
                return;
            const date = new Date(order.order_date);
            if (isNaN(date.getTime())) {
                console.warn("Invalid date: ", order.order_date);
                return;
            }
            const key = this.getPeriodKey(date, period);
            const amount = Number(order.total_amount) || 0;
            revenueByPeriod[key] = (revenueByPeriod[key] || 0) + amount;
            orderCountByPeriod[key] = (orderCountByPeriod[key] || 0) + 1;
        });
        const totalRevenue = Object.values(revenueByPeriod).reduce((sum, val) => sum + val, 0);
        return {
            revenue: revenueByPeriod,
            orderCount: orderCountByPeriod,
            period,
            totalRevenue,
            totalOrders: orders.length,
        };
    }
    async getProductStatistics() {
        const [totalProducts, productItems] = await Promise.all([
            this.statisticsRepo.getProductsCount(),
            this.statisticsRepo.getProductItems(),
        ]);
        const totalQuantity = productItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
        const outOfStockProducts = productItems.filter((item) => (item.quantity || 0) === 0).length;
        return {
            totalProducts,
            totalQuantity,
            outOfStockProducts,
            inStockProducts: totalProducts - outOfStockProducts,
        };
    }
    async getOrderStatistics() {
        const orders = await this.statisticsRepo.getAllOrders();
        const statusCount = {};
        const statusRevenue = {};
        orders.forEach((order) => {
            const status = order.status || "Unknown";
            statusCount[status] = (statusCount[status] || 0) + 1;
            if (order.total_amount) {
                statusRevenue[status] =
                    (statusRevenue[status] || 0) + (order.total_amount || 0);
            }
        });
        return {
            statusCount,
            statusRevenue,
            totalOrders: orders.length,
        };
    }
    async getSummaryStatistics(startDate, endDate) {
        const [orders, totalCustomers, totalProducts, totalPurchaseOrders] = await Promise.all([
            this.statisticsRepo.getOrderByDateRange(startDate, endDate),
            this.statisticsRepo.getCustomerCount(),
            this.statisticsRepo.getProductsCount(),
            this.statisticsRepo.getPurchaseOrdersCount(startDate, endDate),
        ]);
        const completedOrders = orders.filter((o) => o.status === "Shipped" || o.status === "Delivered");
        const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
        return {
            totalOrders: orders.length,
            completedOrders: completedOrders.length,
            totalRevenue,
            totalCustomers,
            totalProducts,
            totalPurchaseOrders,
            period: startDate && endDate ? { startDate, endDate } : null,
        };
    }
};
exports.StatisticsService = StatisticsService;
exports.StatisticsService = StatisticsService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(StatisticsRepository_1.StatisticsRepository)),
    __metadata("design:paramtypes", [StatisticsRepository_1.StatisticsRepository])
], StatisticsService);
//# sourceMappingURL=StatisticsService.js.map