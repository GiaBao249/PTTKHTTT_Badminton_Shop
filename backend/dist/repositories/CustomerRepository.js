"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerRepository = void 0;
const tsyringe_1 = require("tsyringe");
const supabase_1 = require("../config/supabase");
let CustomerRepository = class CustomerRepository {
    async findAll() {
        const { data, error } = await supabase_1.supabase.from("customer").select("*");
        if (error) {
            throw error;
        }
        return data ?? [];
    }
    async findById(customerId) {
        const { data, error } = await supabase_1.supabase
            .from("customer")
            .select("*")
            .eq("customer_id", customerId)
            .single();
        if (error)
            throw error;
        return data;
    }
    async getOrdersStats() {
        const { data: orders, error } = await supabase_1.supabase
            .from("orders")
            .select("customer_id, total_amount, status");
        if (error)
            throw error;
        const statsMap = new Map();
        (orders ?? []).forEach((order) => {
            const customerId = order.customer_id;
            if (!customerId)
                return;
            const entry = statsMap.get(customerId) || {
                total_orders: 0,
                total_spent: 0,
            };
            entry.total_orders += 1;
            if (order.total_amount) {
                entry.total_spent += Number(order.total_amount || 0);
            }
            statsMap.set(customerId, entry);
        });
        return statsMap;
    }
};
exports.CustomerRepository = CustomerRepository;
exports.CustomerRepository = CustomerRepository = __decorate([
    (0, tsyringe_1.injectable)()
], CustomerRepository);
//# sourceMappingURL=CustomerRepository.js.map