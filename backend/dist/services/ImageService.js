"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageService = void 0;
const tsyringe_1 = require("tsyringe");
const ImageRepository_1 = require("../repositories/ImageRepository");
const errorHandler_1 = require("../middleware/errorHandler");
let ImageService = class ImageService {
    constructor(imageRepo) {
        this.imageRepo = imageRepo;
    }
    /**
     * Upload image và lưu vào database
     */
    async uploadImage(uploadDto) {
        const { product_item_id, file } = uploadDto;
        // Validation
        if (!file) {
            throw new errorHandler_1.AppError(400, "Không có file ảnh được gửi", "VALIDATION_ERROR");
        }
        if (!product_item_id) {
            throw new errorHandler_1.AppError(400, "Thiếu product_item_id", "VALIDATION_ERROR");
        }
        // Kiểm tra file type
        if (!file.mimetype.startsWith("image/")) {
            throw new errorHandler_1.AppError(400, "Chỉ chấp nhận file ảnh", "VALIDATION_ERROR");
        }
        // Kiểm tra file size (5MB limit)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            throw new errorHandler_1.AppError(400, "File ảnh không được vượt quá 5MB", "VALIDATION_ERROR");
        }
        // Kiểm tra product_item có tồn tại không
        const productItemExists = await this.imageRepo.checkProductItemExists(product_item_id);
        if (!productItemExists) {
            throw new errorHandler_1.AppError(404, "Không tìm thấy product item", "PRODUCT_ITEM_NOT_FOUND");
        }
        // Generate unique filename
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const fileExtension = file.originalname.split(".").pop();
        const fileName = `product_${product_item_id}_${timestamp}_${randomString}.${fileExtension}`;
        try {
            // Upload to storage
            console.log(`Uploading image: ${fileName}, size: ${file.size}, type: ${file.mimetype}`);
            await this.imageRepo.uploadToStorage(fileName, file.buffer, file.mimetype);
            console.log("Image uploaded successfully:", fileName);
            // Get public URL
            const publicUrl = this.imageRepo.getPublicUrl(fileName);
            // Save to database
            const imageRecord = await this.imageRepo.createImageRecord(product_item_id, fileName);
            return {
                success: true,
                image: {
                    image_id: imageRecord.image_id,
                    image_filename: fileName,
                    public_url: publicUrl,
                },
            };
        }
        catch (error) {
            // Rollback: xóa file đã upload nếu lưu database thất bại
            try {
                await this.imageRepo.deleteFromStorage(fileName);
            }
            catch (rollbackError) {
                console.error("Error during rollback:", rollbackError);
            }
            // Re-throw error
            if (error instanceof errorHandler_1.AppError) {
                throw error;
            }
            throw new errorHandler_1.AppError(500, error.message || "Lỗi server khi upload ảnh", "UPLOAD_ERROR");
        }
    }
};
exports.ImageService = ImageService;
exports.ImageService = ImageService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(ImageRepository_1.ImageRepository)),
    __metadata("design:paramtypes", [ImageRepository_1.ImageRepository])
], ImageService);
//# sourceMappingURL=ImageService.js.map