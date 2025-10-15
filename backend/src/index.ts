import "dotenv/config";
import express from "express";
import cors from "cors";
import { testConnection } from "./config/database";
import productRoutes from "./routes/products";

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 8000;

// Test route
app.get("/", (req, res) => {
  res.json({ message: "Badminton Shop API is running!" });
});

// API Routes
app.use("/api/products", productRoutes);

// Khởi động server
const startServer = async () => {
  try {
    // Kiểm tra kết nối database
    await testConnection();

    app.listen(port, () => {
      console.log(`Backend running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
