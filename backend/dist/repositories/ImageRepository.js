"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageRepository = void 0;
const tsyringe_1 = require("tsyringe");
const supabase_1 = require("../config/supabase");
let ImageRepository = class ImageRepository {
    /**
     * Upload file lên Supabase Storage
     */
    async uploadToStorage(fileName, fileBuffer, contentType) {
        const { error } = await supabase_1.supabase.storage
            .from("product-images")
            .upload(fileName, fileBuffer, {
            contentType,
            upsert: false,
        });
        if (error) {
            // Check if bucket exists
            if (error.message?.includes("Bucket not found") ||
                error.message?.includes("not found")) {
                throw new Error("Bucket 'product-images' chưa được tạo trong Supabase Storage. Vui lòng tạo bucket trước.");
            }
            throw new Error(`Lỗi khi upload ảnh lên storage: ${error.message || JSON.stringify(error)}`);
        }
    }
    /**
     * Lấy public URL của file
     */
    getPublicUrl(fileName) {
        const { data: { publicUrl }, } = supabase_1.supabase.storage.from("product-images").getPublicUrl(fileName);
        return publicUrl;
    }
    /**
     * Lưu image record vào database
     */
    async createImageRecord(productItemId, fileName) {
        const { data, error } = await supabase_1.supabase
            .from("product_image")
            .insert([
            {
                product_item_id: productItemId,
                image_filename: fileName,
            },
        ])
            .select()
            .single();
        if (error) {
            throw new Error(`Lỗi khi lưu thông tin ảnh: ${error.message}`);
        }
        return data;
    }
    /**
     * Xóa file từ storage (rollback khi lưu database thất bại)
     */
    async deleteFromStorage(fileName) {
        const { error } = await supabase_1.supabase.storage
            .from("product-images")
            .remove([fileName]);
        if (error) {
            console.error(`Warning: Không thể xóa file ${fileName} từ storage:`, error);
            // Không throw error vì đây là cleanup operation
        }
    }
    /**
     * Kiểm tra product_item có tồn tại không
     */
    async checkProductItemExists(productItemId) {
        const { data, error } = await supabase_1.supabase
            .from("product_item")
            .select("product_item_id")
            .eq("product_item_id", productItemId)
            .single();
        if (error || !data) {
            return false;
        }
        return true;
    }
};
exports.ImageRepository = ImageRepository;
exports.ImageRepository = ImageRepository = __decorate([
    (0, tsyringe_1.injectable)()
], ImageRepository);
//# sourceMappingURL=ImageRepository.js.map