"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TopSellingProductRepository = void 0;
const tsyringe_1 = require("tsyringe");
const supabase_1 = require("../config/supabase");
let TopSellingProductRepository = class TopSellingProductRepository {
    async getOrderDetails() {
        const { data, error } = await supabase_1.supabase
            .from("orderdetail")
            .select("product_item_id , quantity");
        if (error) {
            throw error;
        }
        return data ?? [];
    }
    async getProductItemsByIds(productItemsIds) {
        if (productItemsIds.length === 0)
            return [];
        const { data, error } = await supabase_1.supabase
            .from("product_item")
            .select("product_item_id, product_id")
            .in("product_item_id", productItemsIds);
        if (error)
            throw error;
        return data ?? [];
    }
    async getProductsWithImages(productIds) {
        if (productIds.length === 0)
            return [];
        const { data, error } = await supabase_1.supabase
            .from("product")
            .select(`product_id, product_name, price, 
        product_item!inner(
        product_id, product_image(
        image_filename
        ))`)
            .in("product_id", productIds)
            .or("is_deleted.is.null,is_deleted.eq.false");
        if (error)
            throw error;
        return data ?? [];
    }
};
exports.TopSellingProductRepository = TopSellingProductRepository;
exports.TopSellingProductRepository = TopSellingProductRepository = __decorate([
    (0, tsyringe_1.injectable)()
], TopSellingProductRepository);
//# sourceMappingURL=TopSellingProductRepository.js.map