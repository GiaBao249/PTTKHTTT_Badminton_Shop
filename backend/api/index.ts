import "reflect-metadata";
import express from "express";
import productRoutes from "../src/routes/products";
import authRoutes from "../src/routes/auth";
import ordersRoutes from "../src/routes/orders";
import infoCustomer from "../src/routes/infoCustomer";
import checkoutRouter from "../src/routes/checkout";
import adminRouter from "../src/routes/admin";
import { registerVietQRRoutes } from "../src/routes/payment/vietqr";
import cors from "cors";

const app = express();

// CORS configuration - Allow all origins for Vercel deployment
app.use(
  cors({
    origin: function (origin, callback) {
      // Cho phép tất cả origins trong production (hoặc chỉ định domain cụ thể)
      const allowedOrigins = [
        "http://localhost:5173",
        "http://localhost:3000",
        /^http:\/\/192\.168\.\d+\.\d+:5173$/,
        /^http:\/\/192\.168\.\d+\.\d+:3000$/,
        // Thêm domain frontend của bạn ở đây
        process.env.FRONTEND_URL,
        /^https:\/\/.*\.vercel\.app$/,
      ].filter(Boolean);

      // Nếu không có origin (ví dụ: mobile app, Postman, etc.)
      if (!origin) return callback(null, true);

      // Kiểm tra origin có match với allowedOrigins không
      const isAllowed = allowedOrigins.some((allowed) => {
        if (!allowed) return false;
        if (typeof allowed === "string") {
          return origin === allowed;
        }
        // Nếu là regex
        return allowed.test(origin);
      });

      if (isAllowed) {
        callback(null, true);
      } else {
        // Trong production, có thể cho phép tất cả hoặc log để debug
        console.warn(`CORS blocked origin: ${origin}`);
        callback(null, true); // Tạm thời cho phép tất cả, có thể thay đổi sau
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/info", infoCustomer);
app.use("/api/checkout", checkoutRouter);
app.use("/api/admin", adminRouter);

// Payment routes
const vietqrRouter = express.Router();
registerVietQRRoutes(vietqrRouter);
app.use("/api/payment/vietqr", vietqrRouter);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Export handler for Vercel serverless
export default app;
