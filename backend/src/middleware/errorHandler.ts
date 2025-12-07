import { Request, Response, NextFunction } from "express";
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message);
    this.name = "AppError";
  }
}
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
    });
  }
  console.log("Unexpected error", err);
  res.status(500).json({
    error: "Lỗi server không xác định",
    code: "INTERNAL_ERROR",
  });
};
