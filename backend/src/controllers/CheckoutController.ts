import { injectable, inject } from "tsyringe";
import { Request, Response } from "express";
import { CheckoutService } from "../services/CheckoutService";
import { CheckoutDto } from "../models/Checkout";
import { AppError } from "../middleware/errorHandler";

@injectable()
export class CheckoutController {
  constructor(
    @inject(CheckoutService) private checkoutService: CheckoutService
  ) {}

  /**
   * POST /api/checkout/checkout
   * Xử lý checkout
   */
  checkout = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = (req as any).user;
      const customerId = user.id;

      const checkoutDto: CheckoutDto = req.body;
      const result = await this.checkoutService.checkout(
        customerId,
        checkoutDto
      );

      res.json(result);
    } catch (error: any) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          error: error.message,
          code: error.code,
        });
      } else {
        console.error("Checkout error:", error);
        res.status(500).json({
          error: error.message || "Lỗi khi đặt hàng",
        });
      }
    }
  };
}

