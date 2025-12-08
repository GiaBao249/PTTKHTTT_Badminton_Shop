import { Request, Response, NextFunction } from "express";
export declare class AppError extends Error {
    statusCode: number;
    message: string;
    code?: string | undefined;
    constructor(statusCode: number, message: string, code?: string | undefined);
}
export declare const errorHandler: (err: Error | AppError, req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=errorHandler.d.ts.map