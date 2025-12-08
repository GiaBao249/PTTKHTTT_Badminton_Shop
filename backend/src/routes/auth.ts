import { Router } from "express";
import { container } from "tsyringe";
import { authRequired } from "../middleware/authRequired";
import { AuthController } from "../controllers/AuthController";

const router = Router();

// Resolve dependency
const authController = container.resolve(AuthController);

// POST /api/auth/login - Đăng nhập (user hoặc admin)
router.post("/login", authController.login);

// POST /api/auth/register - Đăng ký (user hoặc admin)
router.post("/register", authController.register);

// GET /api/auth/me - Lấy thông tin user hiện tại (protected)
router.get("/me", authRequired, authController.getMe);

export default router;
