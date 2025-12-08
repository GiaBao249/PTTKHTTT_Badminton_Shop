"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardRepository = void 0;
const tsyringe_1 = require("tsyringe");
const supabase_1 = require("../config/supabase");
let DashboardRepository = class DashboardRepository {
    async getOrdersForStats() {
        const { data, error } = await supabase_1.supabase
            .from("orders")
            .select("total_amount, status");
        if (error)
            throw error;
        return data ?? [];
    }
    async getTotalCustomers() {
        const { count, error } = await supabase_1.supabase
            .from("customer")
            .select("customer_id", { count: "exact", head: true });
        if (error)
            throw error;
        return count ?? 0;
    }
    async getTotalProducts() {
        const { count, error } = await supabase_1.supabase
            .from("product")
            .select("product_id", { count: "exact", head: true })
            .or("is_deleted.is.null,is_deleted.eq.false");
        if (error)
            throw error;
        return count ?? 0;
    }
    async getAllStatsData() {
        const [orders, totalCustomers, totalProducts] = await Promise.all([
            this.getOrdersForStats(),
            this.getTotalCustomers(),
            this.getTotalProducts(),
        ]);
        return {
            orders,
            totalCustomers,
            totalProducts,
        };
    }
};
exports.DashboardRepository = DashboardRepository;
exports.DashboardRepository = DashboardRepository = __decorate([
    (0, tsyringe_1.injectable)()
], DashboardRepository);
//# sourceMappingURL=DashboardRepository.js.map