"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CancelOrderRepository = void 0;
const tsyringe_1 = require("tsyringe");
const supabase_1 = require("../config/supabase");
let CancelOrderRepository = class CancelOrderRepository {
    /**
     * Lấy order theo ID
     */
    async getOrderById(orderId) {
        const { data, error } = await supabase_1.supabase
            .from("orders")
            .select("order_id, customer_id, status")
            .eq("order_id", orderId)
            .single();
        if (error || !data)
            return null;
        return data;
    }
    /**
     * Lấy order details
     */
    async getOrderDetails(orderId) {
        const { data, error } = await supabase_1.supabase
            .from("orderdetail")
            .select("product_item_id, quantity")
            .eq("order_id", orderId);
        if (error)
            throw error;
        return data ?? [];
    }
    /**
     * Lấy quantity của product item
     */
    async getProductItemQuantity(productItemId) {
        const { data, error } = await supabase_1.supabase
            .from("product_item")
            .select("quantity")
            .eq("product_item_id", productItemId)
            .single();
        if (error)
            return null;
        return data?.quantity ?? null;
    }
    /**
     * Cập nhật quantity của product item
     */
    async updateProductItemQuantity(productItemId, newQuantity) {
        const { error } = await supabase_1.supabase
            .from("product_item")
            .update({ quantity: newQuantity })
            .eq("product_item_id", productItemId);
        if (error)
            throw error;
    }
    /**
     * Cập nhật order status
     */
    async updateOrderStatus(orderId, status) {
        const { data, error } = await supabase_1.supabase
            .from("orders")
            .update({ status })
            .eq("order_id", orderId)
            .select()
            .single();
        if (error)
            throw error;
        return data;
    }
};
exports.CancelOrderRepository = CancelOrderRepository;
exports.CancelOrderRepository = CancelOrderRepository = __decorate([
    (0, tsyringe_1.injectable)()
], CancelOrderRepository);
//# sourceMappingURL=CancelOrderRepository.js.map