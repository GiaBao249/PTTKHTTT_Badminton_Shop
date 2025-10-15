import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// Tạo connection pool để quản lý kết nối hiệu quả
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "badminton_shop",
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10, // Số kết nối tối đa
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

// Kiểm tra kết nối
export const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log("Kết nối database thành công!");
    connection.release();
    return true;
  } catch (error) {
    console.error("Lỗi kết nối database:", error);
    return false;
  }
};

export default pool;
