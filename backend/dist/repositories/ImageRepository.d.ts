import { ProductImage } from "../models/Image";
export declare class ImageRepository {
    /**
     * Upload file lên Supabase Storage
     */
    uploadToStorage(fileName: string, fileBuffer: Buffer, contentType: string): Promise<void>;
    /**
     * Lấy public URL của file
     */
    getPublicUrl(fileName: string): string;
    /**
     * Lưu image record vào database
     */
    createImageRecord(productItemId: number, fileName: string): Promise<ProductImage>;
    /**
     * Xóa file từ storage (rollback khi lưu database thất bại)
     */
    deleteFromStorage(fileName: string): Promise<void>;
    /**
     * Kiểm tra product_item có tồn tại không
     */
    checkProductItemExists(productItemId: number): Promise<boolean>;
}
//# sourceMappingURL=ImageRepository.d.ts.map