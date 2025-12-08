"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRequired = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET;
/**
 * Xử lí middleware cho auth
 * @param {Request} req : gửi yêu cầu đến cho sever
 * @param {Response} res : sever phản hồi về lại cho client
 * @param {NextFunction} next : dùng để kiểm soát req , có cho req tiếp tục đi tiếp hay không ?
 * @returns {void}
 */
const authRequired = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader?.startsWith("Bearer ")) {
            res.status(401).json({ error: "Invalid token" });
            return;
        }
        const token = authHeader.substring(7);
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (err) {
        res.status(401).json({ error: "Invalid token" });
    }
};
exports.authRequired = authRequired;
//# sourceMappingURL=authRequired.js.map