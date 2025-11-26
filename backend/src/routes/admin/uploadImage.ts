import { Request, Response, Router } from "express";
import { supabase } from "../../config/supabase";
import { checkPermission } from "../../middleware/checkPermission";
import multer from "multer";

// Configure multer for memory storage
const upload = multer({
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

export function registerUploadImage(router: Router) {
  // Multer error handler middleware
  const uploadMiddleware = upload.single("image");
  
  router.post(
    "/uploadImage",
    checkPermission("product:create"),
    (req: Request, res: Response, next: any) => {
      uploadMiddleware(req, res, (err: any) => {
        if (err) {
          console.error("Multer error:", err);
          return res.status(400).json({ 
            error: err.message || "Lỗi khi xử lý file ảnh" 
          });
        }
        next();
      });
    },
    async (req: Request, res: Response) => {
      try {
        if (!req.file) {
          return res.status(400).json({ error: "Không có file ảnh được gửi" });
        }

        const file = req.file;
        const { product_item_id } = req.body;

        if (!product_item_id) {
          return res.status(400).json({ error: "Thiếu product_item_id" });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const fileExtension = file.originalname.split(".").pop();
        const fileName = `product_${product_item_id}_${timestamp}_${randomString}.${fileExtension}`;

        // Upload to Supabase Storage
        console.log(`Uploading image: ${fileName}, size: ${file.size}, type: ${file.mimetype}`);
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(fileName, file.buffer, {
            contentType: file.mimetype,
            upsert: false,
          });

        if (uploadError) {
          console.error("Error uploading to storage:", uploadError);
          // Check if bucket exists or permission issue
          if (uploadError.message?.includes("Bucket not found") || uploadError.message?.includes("not found")) {
            return res.status(500).json({
              error: "Bucket 'product-images' chưa được tạo trong Supabase Storage. Vui lòng tạo bucket trước.",
            });
          }
          return res.status(500).json({
            error: "Lỗi khi upload ảnh lên storage: " + (uploadError.message || JSON.stringify(uploadError)),
          });
        }
        
        console.log("Image uploaded successfully:", uploadData);

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("product-images").getPublicUrl(fileName);

        // Save image record to database
        const { data: imageRecord, error: dbError } = await supabase
          .from("product_image")
          .insert([
            {
              product_item_id: Number(product_item_id),
              image_filename: fileName,
            },
          ])
          .select()
          .single();

        if (dbError) {
          console.error("Error saving image record:", dbError);
          // Try to delete uploaded file
          await supabase.storage.from("product-images").remove([fileName]);
          return res.status(500).json({
            error: "Lỗi khi lưu thông tin ảnh: " + dbError.message,
          });
        }

        return res.json({
          success: true,
          image: {
            image_id: imageRecord.image_id,
            image_filename: fileName,
            public_url: publicUrl,
          },
        });
      } catch (error: any) {
        console.error("Error in uploadImage:", error);
        return res.status(500).json({
          error: error.message || "Lỗi server khi upload ảnh",
        });
      }
    }
  );
}

