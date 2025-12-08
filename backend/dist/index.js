"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const products_1 = __importDefault(require("./routes/products"));
const auth_1 = __importDefault(require("./routes/auth"));
const orders_1 = __importDefault(require("./routes/orders"));
const infoCustomer_1 = __importDefault(require("./routes/infoCustomer"));
const checkout_1 = __importDefault(require("./routes/checkout"));
const admin_1 = __importDefault(require("./routes/admin"));
const vietqr_1 = require("./routes/payment/vietqr");
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        // Cho phép requests từ localhost và tất cả IP addresses trong mạng local
        const allowedOrigins = [
            "http://localhost:5173",
            "http://localhost:3000",
            /^http:\/\/192\.168\.\d+\.\d+:5173$/, // Cho phép mọi IP 192.168.x.x:5173
            /^http:\/\/192\.168\.\d+\.\d+:3000$/, // Cho phép mọi IP 192.168.x.x:3000
        ];
        // Nếu không có origin (ví dụ: mobile app, Postman, etc.)
        if (!origin)
            return callback(null, true);
        // Kiểm tra origin có match với allowedOrigins không
        const isAllowed = allowedOrigins.some((allowed) => {
            if (typeof allowed === "string") {
                return origin === allowed;
            }
            // Nếu là regex
            return allowed.test(origin);
        });
        if (isAllowed) {
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: false,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true })); // Cần cho VNPay IPN callback
// Routes
app.use("/api/products", products_1.default);
app.use("/api/auth", auth_1.default);
app.use("/api/orders", orders_1.default);
app.use("/api/info", infoCustomer_1.default);
app.use("/api/checkout", checkout_1.default);
app.use("/api/admin", admin_1.default);
// Payment routes
const vietqrRouter = express_1.default.Router();
(0, vietqr_1.registerVietQRRoutes)(vietqrRouter);
app.use("/api/payment/vietqr", vietqrRouter);
app.listen(3000, "0.0.0.0", () => {
    console.log("Server is running on port 3000 (0.0.0.0)");
    console.log("Backend accessible from: http://localhost:3000 or http://<your-ip>:3000");
});
//# sourceMappingURL=index.js.map