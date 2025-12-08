import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Xử lí middleware cho auth
 * @param {Request} req : gửi yêu cầu đến cho sever
 * @param {Response} res : sever phản hồi về lại cho client
 * @param {NextFunction} next : dùng để kiểm soát req , có cho req tiếp tục đi tiếp hay không ?
 * @returns {void}
 */
export const authRequired = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Invalid token" });
    }
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET!) as any;
    (req as any).user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};
