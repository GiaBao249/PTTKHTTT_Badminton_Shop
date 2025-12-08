import { Request, Response, NextFunction } from "express";
/**
 * Middleware để kiểm tra permission của admin
 * @param permissionCode - Code của permission cần check (VD: "product:create", "dashboard:read")
 */
export declare const checkPermission: (permissionCode: string) => (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
//# sourceMappingURL=checkPermission.d.ts.map