"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.AppError = void 0;
class AppError extends Error {
    constructor(statusCode, message, code) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.code = code;
        this.name = "AppError";
    }
}
exports.AppError = AppError;
const errorHandler = (err, req, res, next) => {
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            error: err.message,
            code: err.code,
        });
        return;
    }
    console.log("Unexpected error", err);
    res.status(500).json({
        error: "Lỗi server không xác định",
        code: "INTERNAL_ERROR",
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map