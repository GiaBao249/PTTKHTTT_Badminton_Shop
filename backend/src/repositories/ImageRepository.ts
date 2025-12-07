import { injectable } from "tsyringe";
import { supabase } from "../config/supabase";
import { ProductImage } from "../models/Image";

@injectable()
export class ImageRepository {
  /**
   * Upload file lên Supabase Storage
   */
  async uploadToStorage(
    fileName: string,
    fileBuffer: Buffer,
    contentType: string
  ): Promise<void> {
    const { error } = await supabase.storage
      .from("product-images")
      .upload(fileName, fileBuffer, {
        contentType,
        upsert: false,
      });

    if (error) {
      // Check if bucket exists
      if (
        error.message?.includes("Bucket not found") ||
        error.message?.includes("not found")
      ) {
        throw new Error(
          "Bucket 'product-images' chưa được tạo trong Supabase Storage. Vui lòng tạo bucket trước."
        );
      }
      throw new Error(
        `Lỗi khi upload ảnh lên storage: ${
          error.message || JSON.stringify(error)
        }`
      );
    }
  }

  /**
   * Lấy public URL của file
   */
  getPublicUrl(fileName: string): string {
    const {
      data: { publicUrl },
    } = supabase.storage.from("product-images").getPublicUrl(fileName);
    return publicUrl;
  }

  /**
   * Lưu image record vào database
   */
  async createImageRecord(
    productItemId: number,
    fileName: string
  ): Promise<ProductImage> {
    const { data, error } = await supabase
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
  async deleteFromStorage(fileName: string): Promise<void> {
    const { error } = await supabase.storage
      .from("product-images")
      .remove([fileName]);

    if (error) {
      console.error(
        `Warning: Không thể xóa file ${fileName} từ storage:`,
        error
      );
      // Không throw error vì đây là cleanup operation
    }
  }

  /**
   * Kiểm tra product_item có tồn tại không
   */
  async checkProductItemExists(productItemId: number): Promise<boolean> {
    const { data, error } = await supabase
      .from("product_item")
      .select("product_item_id")
      .eq("product_item_id", productItemId)
      .single();

    if (error || !data) {
      return false;
    }
    return true;
  }
}
