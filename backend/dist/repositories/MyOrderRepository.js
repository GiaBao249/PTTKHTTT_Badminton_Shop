"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyOrderRepository = void 0;
const tsyringe_1 = require("tsyringe");
const supabase_1 = require("../config/supabase");
let MyOrderRepository = class MyOrderRepository {
    /**
     * Lấy orders của customer
     */
    async getOrdersByCustomerId(customerId) {
        const { data, error } = await supabase_1.supabase
            .from("orders")
            .select("*")
            .eq("customer_id", customerId);
        if (error)
            throw error;
        return data ?? [];
    }
    /**
     * Lấy order details theo order IDs
     */
    async getOrderDetailsByOrderIds(orderIds) {
        if (orderIds.length === 0)
            return [];
        const { data, error } = await supabase_1.supabase
            .from("orderdetail")
            .select("order_id, product_item_id, quantity")
            .in("order_id", orderIds);
        if (error)
            throw error;
        return data ?? [];
    }
    /**
     * Lấy product items với product info
     */
    async getProductItemsWithProducts(productItemIds) {
        if (productItemIds.length === 0)
            return [];
        const { data, error } = await supabase_1.supabase
            .from("product_item")
            .select(`
        product_item_id,
        product_id,
        product:product_id(
          product_id,
          product_name,
          category:category_id(
            category_id,
            category_name
          )
        )
      `)
            .in("product_item_id", productItemIds);
        if (error)
            throw error;
        return data ?? [];
    }
};
exports.MyOrderRepository = MyOrderRepository;
exports.MyOrderRepository = MyOrderRepository = __decorate([
    (0, tsyringe_1.injectable)()
], MyOrderRepository);
//# sourceMappingURL=MyOrderRepository.js.map