import { ImageRepository } from "../repositories/ImageRepository";
import { UploadImageResponse, UploadImageDto } from "../models/Image";
export declare class ImageService {
    private imageRepo;
    constructor(imageRepo: ImageRepository);
    /**
     * Upload image và lưu vào database
     */
    uploadImage(uploadDto: UploadImageDto): Promise<UploadImageResponse>;
}
//# sourceMappingURL=ImageService.d.ts.map