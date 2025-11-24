import express from "express";
import productRoutes from "./routes/products";
import authRoutes from "./routes/auth";
import ordersRoutes from "./routes/orders";
import infoCustomer from "./routes/infoCustomer";
import checkoutRouter from "./routes/checkout";
import adminRouter from "./routes/admin";
import { registerVietQRRoutes } from "./routes/payment/vietqr";
import cors from "cors";
const app = express();

app.use(
  cors({
    origin: function (origin, callback) {
      // Cho phép requests từ localhost và tất cả IP addresses trong mạng local
      const allowedOrigins = [
        "http://localhost:5173",
        "http://localhost:3000",
        /^http:\/\/192\.168\.\d+\.\d+:5173$/, // Cho phép mọi IP 192.168.x.x:5173
        /^http:\/\/192\.168\.\d+\.\d+:3000$/, // Cho phép mọi IP 192.168.x.x:3000
      ];

      // Nếu không có origin (ví dụ: mobile app, Postman, etc.)
      if (!origin) return callback(null, true);

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
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: false,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Cần cho VNPay IPN callback

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
app.listen(3000, "0.0.0.0", () => {
  console.log("Server is running on port 3000 (0.0.0.0)");
  console.log(
    "Backend accessible from: http://localhost:3000 or http://<your-ip>:3000"
  );
});
