import { Request, Response } from "express";
import { ImageService } from "../services/ImageService";
export declare class ImageController {
    private imageService;
    constructor(imageService: ImageService);
    private upload;
    /**
     * POST /api/admin/uploadImage
     * Upload image cho product item
     * Multer middleware được xử lý trong controller
     */
    uploadImage: (req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=ImageController.d.ts.map