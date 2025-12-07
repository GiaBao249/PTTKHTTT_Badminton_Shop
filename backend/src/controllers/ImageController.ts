import { injectable, inject } from "tsyringe";
import { Request, Response } from "express";
import { ImageService } from "../services/ImageService";
import { AppError } from "../middleware/errorHandler";
import multer from "multer";

@injectable()
export class ImageController {
  constructor(@inject(ImageService) private imageService: ImageService) {}

  // Configure multer for memory storage
  private upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
      // Accept only image files
      if (file.mimetype.startsWith("image/")) {
        cb(null, true);
      } else {
        cb(new Error("Chỉ chấp nhận file ảnh"));
      }
    },
  });

  /**
   * POST /api/admin/uploadImage
   * Upload image cho product item
   * Multer middleware được xử lý trong controller
   */
  uploadImage = async (req: Request, res: Response): Promise<void> => {
    // Multer error handler middleware
    const uploadMiddleware = this.upload.single("image");

    uploadMiddleware(req, res, async (err: any) => {
      try {
        // Handle multer errors
        if (err) {
          console.error("Multer error:", err);
          res.status(400).json({
            error: err.message || "Lỗi khi xử lý file ảnh",
          });
          return;
        }

        // Check if file exists
        if (!req.file) {
          res.status(400).json({ error: "Không có file ảnh được gửi" });
          return;
        }

        const { product_item_id } = req.body;

        // Call service
        const result = await this.imageService.uploadImage({
          product_item_id: Number(product_item_id),
          file: req.file,
        });

        res.json(result);
      } catch (error: any) {
        if (error instanceof AppError) {
          res.status(error.statusCode).json({
            error: error.message,
            code: error.code,
          });
        } else {
          console.error("Error in uploadImage:", error);
          res.status(500).json({
            error: error.message || "Lỗi server khi upload ảnh",
          });
        }
      }
    });
  };
}
