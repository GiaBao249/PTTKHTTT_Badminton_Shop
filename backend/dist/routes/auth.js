"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tsyringe_1 = require("tsyringe");
const authRequired_1 = require("../middleware/authRequired");
const AuthController_1 = require("../controllers/AuthController");
const router = (0, express_1.Router)();
// Resolve dependency
const authController = tsyringe_1.container.resolve(AuthController_1.AuthController);
// POST /api/auth/login - Đăng nhập (user hoặc admin)
router.post("/login", authController.login);
// POST /api/auth/register - Đăng ký (user hoặc admin)
router.post("/register", authController.register);
// GET /api/auth/me - Lấy thông tin user hiện tại (protected)
router.get("/me", authRequired_1.authRequired, authController.getMe);
exports.default = router;
//# sourceMappingURL=auth.js.map