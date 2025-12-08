export interface ProductImage {
    image_id: number;
    product_item_id: number;
    image_filename: string;
}
export interface UploadImageResponse {
    success: boolean;
    image: {
        image_id: number;
        image_filename: string;
        public_url: string;
    };
}
export interface UploadImageDto {
    product_item_id: number;
    file: Express.Multer.File;
}
//# sourceMappingURL=Image.d.ts.map