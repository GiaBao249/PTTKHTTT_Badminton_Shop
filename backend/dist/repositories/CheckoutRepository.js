"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckoutRepository = void 0;
const tsyringe_1 = require("tsyringe");
const supabase_1 = require("../config/supabase");
let CheckoutRepository = class CheckoutRepository {
    /**
     * Lấy product items theo IDs
     */
    async getProductItemsByIds(productItemIds) {
        if (productItemIds.length === 0)
            return [];
        const { data, error } = await supabase_1.supabase
            .from("product_item")
            .select("product_item_id, quantity")
            .in("product_item_id", productItemIds);
        if (error)
            throw error;
        return data ?? [];
    }
    /**
     * Tạo địa chỉ mới
     */
    async createAddress(customerId, shippingInfo) {
        const { data, error } = await supabase_1.supabase
            .from("address")
            .insert({
            customer_id: customerId,
            address_line: shippingInfo.address,
            ward: shippingInfo.ward || "",
            district: shippingInfo.district,
            city: shippingInfo.city,
            postal_code: shippingInfo.postalCode || "",
        })
            .select("address_id")
            .single();
        if (error)
            throw error;
        if (!data)
            throw new Error("Không thể tạo địa chỉ");
        return data.address_id;
    }
    /**
     * Tạo order
     */
    async createOrder(customerId, addressId, totalAmount) {
        const { data, error } = await supabase_1.supabase
            .from("orders")
            .insert({
            customer_id: customerId,
            address_id: addressId,
            status: "Pending",
            total_amount: totalAmount,
            order_date: new Date().toISOString(),
            delivery_date: null,
        })
            .select("order_id")
            .single();
        if (error) {
            console.error("Order error details:", {
                message: error.message,
                code: error.code,
                details: error.details,
                hint: error.hint,
            });
            throw error;
        }
        if (!data)
            throw new Error("Không thể tạo đơn hàng");
        return data.order_id;
    }
    /**
     * Tạo order details
     */
    async createOrderDetails(orderId, cartItems) {
        const orderDetails = cartItems.map((item) => ({
            order_id: orderId,
            product_item_id: item.product_item_id,
            quantity: item.quantity,
            amount: item.total_amount || item.quantity * (item.price || 0),
        }));
        const { error } = await supabase_1.supabase.from("orderdetail").insert(orderDetails);
        if (error)
            throw error;
    }
    /**
     * Cập nhật số lượng product item (trừ inventory)
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
     * Lấy cart của customer
     */
    async getCartByCustomerId(customerId) {
        const { data, error } = await supabase_1.supabase
            .from("cart")
            .select("cart_id")
            .eq("customer_id", customerId)
            .single();
        if (error || !data)
            return null;
        return data.cart_id;
    }
    /**
     * Xóa cart items
     */
    async deleteCartItems(cartId, productItemIds) {
        const { error } = await supabase_1.supabase
            .from("cartitems")
            .delete()
            .eq("cart_id", cartId)
            .in("product_item_id", productItemIds);
        if (error) {
            console.error("Error deleting checked out cart items:", error);
            throw error;
        }
    }
};
exports.CheckoutRepository = CheckoutRepository;
exports.CheckoutRepository = CheckoutRepository = __decorate([
    (0, tsyringe_1.injectable)()
], CheckoutRepository);
//# sourceMappingURL=CheckoutRepository.js.map