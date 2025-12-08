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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const tsyringe_1 = require("tsyringe");
const AuthService_1 = require("../services/AuthService");
const errorHandler_1 = require("../middleware/errorHandler");
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
        /**
         * POST /api/auth/login
         * Đăng nhập (user hoặc admin)
         */
        this.login = async (req, res) => {
            try {
                const loginDto = req.body;
                const result = await this.authService.login(loginDto);
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
                    console.error("Error in login:", error);
                    res.status(401).json({ error: "Lỗi Server" });
                }
            }
        };
        /**
         * POST /api/auth/register
         * Đăng ký (user hoặc admin)
         */
        this.register = async (req, res) => {
            try {
                const registerDto = req.body;
                const result = await this.authService.register(registerDto);
                res.status(201).json({
                    message: "Đăng ký thành công",
                    token: result.token,
                    user: {
                        id: result.id,
                        username: result.username,
                        role: result.role,
                        name: result.name,
                    },
                });
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    res.status(error.statusCode).json({
                        error: error.message,
                        code: error.code,
                    });
                }
                else {
                    console.error("Error in register:", error);
                    res.status(401).json({ error: "Lỗi Server" });
                }
            }
        };
        /**
         * GET /api/auth/me
         * Lấy thông tin user hiện tại (protected route)
         */
        this.getMe = async (req, res) => {
            try {
                const user = req.user;
                const userInfo = this.authService.getCurrentUser(user);
                res.json(userInfo);
            }
            catch (error) {
                console.error("Error in getMe:", error);
                res.status(500).json({ error: "Lỗi Server" });
            }
        };
    }
};
exports.AuthController = AuthController;
exports.AuthController = AuthController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(AuthService_1.AuthService)),
    __metadata("design:paramtypes", [AuthService_1.AuthService])
], AuthController);
//# sourceMappingURL=AuthController.js.map