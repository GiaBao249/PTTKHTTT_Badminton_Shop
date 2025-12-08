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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageController = void 0;
const tsyringe_1 = require("tsyringe");
const ImageService_1 = require("../services/ImageService");
const errorHandler_1 = require("../middleware/errorHandler");
const multer_1 = __importDefault(require("multer"));
let ImageController = class ImageController {
    constructor(imageService) {
        this.imageService = imageService;
        // Configure multer for memory storage
        this.upload = (0, multer_1.default)({
            storage: multer_1.default.memoryStorage(),
            limits: {
                fileSize: 5 * 1024 * 1024, // 5MB limit
            },
            fileFilter: (req, file, cb) => {
                // Accept only image files
                if (file.mimetype.startsWith("image/")) {
                    cb(null, true);
                }
                else {
                    cb(new Error("Chỉ chấp nhận file ảnh"));
                }
            },
        });
        /**
         * POST /api/admin/uploadImage
         * Upload image cho product item
         * Multer middleware được xử lý trong controller
         */
        this.uploadImage = async (req, res) => {
            // Multer error handler middleware
            const uploadMiddleware = this.upload.single("image");
            uploadMiddleware(req, res, async (err) => {
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
                }
                catch (error) {
                    if (error instanceof errorHandler_1.AppError) {
                        res.status(error.statusCode).json({
                            error: error.message,
                            code: error.code,
                        });
                    }
                    else {
                        console.error("Error in uploadImage:", error);
                        res.status(500).json({
                            error: error.message || "Lỗi server khi upload ảnh",
                        });
                    }
                }
            });
        };
    }
};
exports.ImageController = ImageController;
exports.ImageController = ImageController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(ImageService_1.ImageService)),
    __metadata("design:paramtypes", [ImageService_1.ImageService])
], ImageController);
//# sourceMappingURL=ImageController.js.map