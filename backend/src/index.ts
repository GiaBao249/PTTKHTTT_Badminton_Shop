import express from "express";
import productRoutes from "./routes/products";
import authRoutes from "./routes/auth";
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
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
