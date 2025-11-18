import express from "express";
import productRoutes from "./routes/products";
import authRoutes from "./routes/auth";
import ordersRoutes from "./routes/orders";
import infoCustomer from "./routes/infoCustomer";
import checkoutRouter from "./routes/checkout";
import adminRouter from "./routes/admin";
import cors from "cors";
const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: false,
  })
);
app.use(express.json());
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/info", infoCustomer);
app.use("/api/checkout", checkoutRouter);
app.use("/api/admin", adminRouter);
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
