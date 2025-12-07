import { injectable, inject } from "tsyringe";
import { Request, Response } from "express";
import { AuthService } from "../services/AuthService";
import { LoginDto, RegisterDto } from "../models/Auth";
import { AppError } from "../middleware/errorHandler";

@injectable()
export class AuthController {
  constructor(@inject(AuthService) private authService: AuthService) {}

  /**
   * POST /api/auth/login
   * Đăng nhập (user hoặc admin)
   */
  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const loginDto: LoginDto = req.body;
      const result = await this.authService.login(loginDto);
      res.json(result);
    } catch (error: any) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          error: error.message,
          code: error.code,
        });
      } else {
        console.error("Error in login:", error);
        res.status(401).json({ error: "Lỗi Server" });
      }
    }
  };

  /**
   * POST /api/auth/register
   * Đăng ký (user hoặc admin)
   */
  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const registerDto: RegisterDto = req.body;
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
    } catch (error: any) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          error: error.message,
          code: error.code,
        });
      } else {
        console.error("Error in register:", error);
        res.status(401).json({ error: "Lỗi Server" });
      }
    }
  };

  /**
   * GET /api/auth/me
   * Lấy thông tin user hiện tại (protected route)
   */
  getMe = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = (req as any).user;
      const userInfo = this.authService.getCurrentUser(user);
      res.json(userInfo);
    } catch (error: any) {
      console.error("Error in getMe:", error);
      res.status(500).json({ error: "Lỗi Server" });
    }
  };
}
