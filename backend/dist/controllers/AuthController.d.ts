import { Request, Response } from "express";
import { AuthService } from "../services/AuthService";
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    /**
     * POST /api/auth/login
     * Đăng nhập (user hoặc admin)
     */
    login: (req: Request, res: Response) => Promise<void>;
    /**
     * POST /api/auth/register
     * Đăng ký (user hoặc admin)
     */
    register: (req: Request, res: Response) => Promise<void>;
    /**
     * GET /api/auth/me
     * Lấy thông tin user hiện tại (protected route)
     */
    getMe: (req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=AuthController.d.ts.map