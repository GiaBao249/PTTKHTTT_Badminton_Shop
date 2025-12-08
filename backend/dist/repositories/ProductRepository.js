"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductRepository = void 0;
const tsyringe_1 = require("tsyringe");
const supabase_1 = require("../config/supabase");
let ProductRepository = class ProductRepository {
    async findAll() {
        const { data, error } = await supabase_1.supabase
            .from("product")
            .select("product_id, supplier_id , category_id , product_name, price, price_purchase , description, warranty_period")
            .or("is_deleted.is.null, is_deleted.eq.false")
            .order("product_id", { ascending: false });
        if (error)
            throw error;
        return data ?? [];
    }
    async findById(productId) {
        const { data, error } = await supabase_1.supabase
            .from("product")
            .select("*")
            .eq("product_id", productId)
            .or("is_deleted.is.null, is_deleted.eq.false")
            .single();
        if (error)
            throw error;
        return data;
    }
    async getProductItemsWithImages(productIds) {
        if (productIds.length === 0)
            return new Map();
        const { data, error } = await supabase_1.supabase
            .from("product_item")
            .select(`
            product_id, product_image (
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
    async create(productData) {
        const { data, error } = await supabase_1.supabase
            .from("product")
            .insert([productData])
            .select()
            .single();
        if (error)
            throw error;
        if (!data || !data.product_id) {
            throw new Error("Không thể tạo sản phẩm: Không nhận được product_id");
        }
        return data;
    }
    async createProductItem(productId) {
        const { data, error } = await supabase_1.supabase
            .from("product_item")
            .insert([{ product_id: productId, quantity: 0 }])
            .select()
            .single();
        if (error)
            throw error;
        if (!data || !data.product_item_id) {
            throw new Error("Không thể tạo product_item: Không nhận được product_item_id");
        }
        return data;
    }
    async createProductConfigurations(productItemId, variationOptionIds) {
        if (variationOptionIds.length === 0)
            return;
        const configurations = variationOptionIds.map((optionId) => ({
            product_item_id: productItemId,
            variation_option_id: optionId,
        }));
        const { error } = await supabase_1.supabase
            .from("product_configuration")
            .insert(configurations);
        if (error)
            throw error;
    }
    async update(productId, updateData) {
        const { data, error } = await supabase_1.supabase
            .from("product")
            .update(updateData)
            .eq("product_id", productId)
            .select()
            .single();
        if (error)
            throw error;
        if (!data) {
            throw new Error("Không tìm thấy sản phẩm sau khi cập nhật");
        }
        return data;
    }
    async softDelete(productId) {
        const { error } = await supabase_1.supabase
            .from("product")
            .update({ is_deleted: true })
            .eq("product_id", productId);
        if (error)
            throw error;
    }
    async findAllProductItems() {
        const { data, error } = await supabase_1.supabase.from("product_item").select("*");
        if (error)
            throw error;
        return data ?? [];
    }
};
exports.ProductRepository = ProductRepository;
exports.ProductRepository = ProductRepository = __decorate([
    (0, tsyringe_1.injectable)()
], ProductRepository);
//# sourceMappingURL=ProductRepository.js.map