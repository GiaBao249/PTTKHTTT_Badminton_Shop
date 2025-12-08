"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartRepository = void 0;
const tsyringe_1 = require("tsyringe");
const supabase_1 = require("../config/supabase");
let CartRepository = class CartRepository {
    /**
     * Lấy cart ID của customer
     */
    async getCartIdByCustomerId(customerId) {
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
     * Tạo cart mới
     */
    async createCart(customerId) {
        const { data, error } = await supabase_1.supabase
            .from("cart")
            .insert({ customer_id: customerId })
            .select("cart_id")
            .single();
        if (error)
            throw error;
        if (!data)
            throw new Error("Không thể tạo cart");
        return data.cart_id;
    }
    /**
     * Lấy cart items với product info
     */
    async getCartItems(cartId) {
        const { data, error } = await supabase_1.supabase
            .from("cartitems")
            .select(`
        quantity,
        total_amount,
        product_item:product_item_id(
          product_item_id,
          product_id,
          quantity,
          product:product_id(
            product_id,
            product_name,
            price,
            is_deleted,
            category:category_id(
              category_id,
              category_name
            )
          )
        )
      `)
            .eq("cart_id", cartId);
        if (error)
            throw error;
        const filtered = (data ?? []).filter((item) => {
            const product = item.product_item?.product;
            return (product && (product.is_deleted === false || product.is_deleted === null));
        });
        return filtered.map((item) => ({
            quantity: item.quantity,
            total_amount: item.total_amount,
            product_item: item.product_item
                ? {
                    product_item_id: item.product_item.product_item_id,
                    product_id: item.product_item.product_id,
                    quantity: item.product_item.quantity,
                    product: item.product_item.product
                        ? {
                            product_id: item.product_item.product.product_id,
                            product_name: item.product_item.product.product_name,
                            price: item.product_item.product.price,
                            is_deleted: item.product_item.product.is_deleted,
                            category: Array.isArray(item.product_item.product.category)
                                ? item.product_item.product.category[0]
                                : item.product_item.product.category,
                        }
                        : undefined,
                }
                : undefined,
        }));
    }
    /**
     * Lấy product items với images để lấy thumbnails
     */
    async getProductItemsWithImages(productIds) {
        if (productIds.length === 0)
            return new Map();
        const { data, error } = await supabase_1.supabase
            .from("product_item")
            .select(`
        product_id,
        product_image(
          image_filename
        )
      `)
            .in("product_id", productIds);
        if (error)
            throw error;
        const thumbnailMap = new Map();
        (data ?? []).forEach((item) => {
            const firstImage = item.product_image?.[0]?.image_filename;
            if (item.product_id && firstImage && !thumbnailMap.has(item.product_id)) {
                const { data: { publicUrl }, } = supabase_1.supabase.storage.from("product-images").getPublicUrl(firstImage);
                thumbnailMap.set(item.product_id, publicUrl);
            }
        });
        return thumbnailMap;
    }
    /**
     * Lấy product item theo ID
     */
    async getProductItemById(productItemId) {
        const { data, error } = await supabase_1.supabase
            .from("product_item")
            .select("product_id, product_item_id, quantity")
            .eq("product_item_id", productItemId)
            .single();
        if (error || !data)
            return null;
        return { product_id: data.product_id, quantity: data.quantity };
    }
    /**
     * Lấy product price
     */
    async getProductPrice(productId) {
        const { data, error } = await supabase_1.supabase
            .from("product")
            .select("price")
            .eq("product_id", productId)
            .or("is_deleted.is.null,is_deleted.eq.false")
            .single();
        if (error || !data)
            return null;
        return data.price;
    }
    /**
     * Lấy cart item hiện có
     */
    async getExistingCartItem(cartId, productItemId) {
        const { data, error } = await supabase_1.supabase
            .from("cartitems")
            .select("*")
            .eq("cart_id", cartId)
            .eq("product_item_id", productItemId)
            .maybeSingle();
        if (error)
            throw error;
        return data;
    }
    /**
     * Thêm cart item
     */
    async addCartItem(cartId, productItemId, quantity, totalAmount) {
        const { data, error } = await supabase_1.supabase
            .from("cartitems")
            .insert({
            cart_id: cartId,
            product_item_id: productItemId,
            quantity: quantity,
            total_amount: totalAmount,
        })
            .select()
            .single();
        if (error)
            throw error;
        return data;
    }
    /**
     * Cập nhật cart item
     */
    async updateCartItem(cartId, productItemId, quantity, totalAmount) {
        const { data, error } = await supabase_1.supabase
            .from("cartitems")
            .update({
            quantity: quantity,
            total_amount: totalAmount,
        })
            .eq("cart_id", cartId)
            .eq("product_item_id", productItemId)
            .select();
        if (error)
            throw error;
        return data?.[0];
    }
    /**
     * Xóa cart item
     */
    async deleteCartItem(cartId, productItemId) {
        const { error } = await supabase_1.supabase
            .from("cartitems")
            .delete()
            .eq("cart_id", cartId)
            .eq("product_item_id", productItemId);
        if (error)
            throw error;
    }
};
exports.CartRepository = CartRepository;
exports.CartRepository = CartRepository = __decorate([
    (0, tsyringe_1.injectable)()
], CartRepository);
//# sourceMappingURL=CartRepository.js.map