import { Request, Response, NextFunction } from "express";
/**
 * Xử lí middleware cho auth
 * @param {Request} req : gửi yêu cầu đến cho sever
 * @param {Response} res : sever phản hồi về lại cho client
 * @param {NextFunction} next : dùng để kiểm soát req , có cho req tiếp tục đi tiếp hay không ?
 * @returns {void}
 */
export declare const authRequired: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=authRequired.d.ts.map