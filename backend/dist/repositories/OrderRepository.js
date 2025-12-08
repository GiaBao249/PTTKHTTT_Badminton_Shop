"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderRepository = void 0;
const tsyringe_1 = require("tsyringe");
const supabase_1 = require("../config/supabase");
let OrderRepository = class OrderRepository {
    async findRecent(limit = 5) {
        const { data, error } = await supabase_1.supabase
            .from("orders")
            .select("*")
            .order("order_date", { ascending: false })
            .limit(limit);
        if (error)
            throw error;
        return data ?? [];
    }
    async findAll() {
        const { data, error } = await supabase_1.supabase
            .from("orders")
            .select("*")
            .order("order_id", { ascending: false });
        if (error)
            throw error;
        return data ?? [];
    }
    async findById(orderId) {
        const { data, error } = await supabase_1.supabase
            .from("orders")
            .select("*")
            .eq("order_id", orderId)
            .single();
        if (error)
            throw error;
        return data;
    }
    async getOrderDetailsByOrderId(orderId) {
        const { data, error } = await supabase_1.supabase
            .from("orderdetail")
            .select("*")
            .eq("order_id", orderId);
        if (error)
            throw error;
        return data ?? [];
    }
    async getOrderStatus(orderId) {
        const { data, error } = await supabase_1.supabase
            .from("orders")
            .select("status")
            .eq("order_id", orderId)
            .single();
        if (error)
            throw error;
        return data?.status || null;
    }
    async updateStatus(orderId, status) {
        const { data, error } = await supabase_1.supabase
            .from("orders")
            .update({ status })
            .eq("order_id", orderId)
            .select()
            .single();
        if (error)
            throw error;
        if (!data) {
            throw new Error("Không tìm thấy đơn hàng sau khi cập nhật");
        }
        return data;
    }
    async getProductItemQuantity(productItemId) {
        const { data, error } = await supabase_1.supabase
            .from("product_item")
            .select("quantity")
            .eq("product_item_id", productItemId)
            .single();
        if (error)
            throw error;
        return data?.quantity ?? null;
    }
    async updateProductItemQuantity(productItemId, newQuantity) {
        const { error } = await supabase_1.supabase
            .from("product_item")
            .update({ quantity: newQuantity })
            .eq("product_item_id", productItemId);
        if (error)
            throw error;
    }
};
exports.OrderRepository = OrderRepository;
exports.OrderRepository = OrderRepository = __decorate([
    (0, tsyringe_1.injectable)()
], OrderRepository);
//# sourceMappingURL=OrderRepository.js.map