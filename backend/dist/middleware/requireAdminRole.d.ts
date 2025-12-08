import { Request, Response, NextFunction } from "express";
/**
 * Middleware để đảm bảo admin phải có ít nhất một role
 * Nếu admin không có role nào, từ chối truy cập
 */
export declare const requireAdminRole: (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
//# sourceMappingURL=requireAdminRole.d.ts.map