"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatisticsRepository = void 0;
const tsyringe_1 = require("tsyringe");
const supabase_1 = require("../config/supabase");
let StatisticsRepository = class StatisticsRepository {
    async getCompletedOrders() {
        const { data, error } = await supabase_1.supabase
            .from("orders")
            .select("total_amount, order_date")
            .in("status", ["Shipped", "Delivered"]);
        if (error)
            throw error;
        return data ?? [];
    }
    async getAllOrders() {
        const { data, error } = await supabase_1.supabase
            .from("orders")
            .select("order_id , status, total_amount , order_date");
        if (error)
            throw error;
        return data ?? [];
    }
    async getOrderByDateRange(startDate, endDate) {
        let query = supabase_1.supabase
            .from("orders")
            .select("order_id, total_amount, status, order_date");
        if (startDate && endDate)
            query = query.gte("order_date", startDate).lte("order_date", endDate);
        const { data, error } = await query;
        if (error)
            throw error;
        return data ?? [];
    }
    async getProductsCount() {
        const { count, error } = await supabase_1.supabase
            .from("product")
            .select("product_id", { count: "exact", head: true })
            .or("is_deleted.is.null, is_deleted.eq.false");
        if (error)
            throw error;
        return count ?? 0;
    }
    async getProductItems() {
        const { data, error } = await supabase_1.supabase
            .from("product_item")
            .select("quantity");
        if (error)
            throw error;
        return data ?? [];
    }
    async getCustomerCount() {
        const { count, error } = await supabase_1.supabase
            .from("customer")
            .select("customer_id", { count: "exact", head: true });
        if (error)
            throw error;
        return count ?? 0;
    }
    async getPurchaseOrdersCount(startDate, endDate) {
        let query = supabase_1.supabase
            .from("purchaseorders")
            .select("purchaseorder_id", { count: "exact", head: true });
        if (startDate && endDate) {
            query = query
                .gte("purchaseorder_date", startDate)
                .lte("purchaseorder_date", endDate);
        }
        const { data, error } = await query;
        if (error)
            throw error;
        return data?.length ?? 0;
    }
};
exports.StatisticsRepository = StatisticsRepository;
exports.StatisticsRepository = StatisticsRepository = __decorate([
    (0, tsyringe_1.injectable)()
], StatisticsRepository);
//# sourceMappingURL=StatisticsRepository.js.map