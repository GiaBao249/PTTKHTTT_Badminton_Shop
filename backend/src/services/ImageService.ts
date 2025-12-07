import { injectable, inject } from "tsyringe";
import { ImageRepository } from "../repositories/ImageRepository";
import { UploadImageResponse, UploadImageDto } from "../models/Image";
import { AppError } from "../middleware/errorHandler";

@injectable()
export class ImageService {
  constructor(@inject(ImageRepository) private imageRepo: ImageRepository) {}

  /**
   * Upload image và lưu vào database
   */
  async uploadImage(uploadDto: UploadImageDto): Promise<UploadImageResponse> {
    const { product_item_id, file } = uploadDto;

    // Validation
    if (!file) {
      throw new AppError(400, "Không có file ảnh được gửi", "VALIDATION_ERROR");
    }

    if (!product_item_id) {
      throw new AppError(400, "Thiếu product_item_id", "VALIDATION_ERROR");
    }

    // Kiểm tra file type
    if (!file.mimetype.startsWith("image/")) {
      throw new AppError(400, "Chỉ chấp nhận file ảnh", "VALIDATION_ERROR");
    }

    // Kiểm tra file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new AppError(
        400,
        "File ảnh không được vượt quá 5MB",
        "VALIDATION_ERROR"
      );
    }

    // Kiểm tra product_item có tồn tại không
    const productItemExists = await this.imageRepo.checkProductItemExists(
      product_item_id
    );
    if (!productItemExists) {
      throw new AppError(
        404,
        "Không tìm thấy product item",
        "PRODUCT_ITEM_NOT_FOUND"
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.originalname.split(".").pop();
    const fileName = `product_${product_item_id}_${timestamp}_${randomString}.${fileExtension}`;

    try {
      // Upload to storage
      console.log(
        `Uploading image: ${fileName}, size: ${file.size}, type: ${file.mimetype}`
      );
      await this.imageRepo.uploadToStorage(
        fileName,
        file.buffer,
        file.mimetype
      );
      console.log("Image uploaded successfully:", fileName);

      // Get public URL
      const publicUrl = this.imageRepo.getPublicUrl(fileName);

      // Save to database
      const imageRecord = await this.imageRepo.createImageRecord(
        product_item_id,
        fileName
      );

      return {
        success: true,
        image: {
          image_id: imageRecord.image_id,
          image_filename: fileName,
          public_url: publicUrl,
        },
      };
    } catch (error: any) {
      // Rollback: xóa file đã upload nếu lưu database thất bại
      try {
        await this.imageRepo.deleteFromStorage(fileName);
      } catch (rollbackError) {
        console.error("Error during rollback:", rollbackError);
      }

      // Re-throw error
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        500,
        error.message || "Lỗi server khi upload ảnh",
        "UPLOAD_ERROR"
      );
    }
  }
}
