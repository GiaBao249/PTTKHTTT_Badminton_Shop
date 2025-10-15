import pool from "../config/database";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export interface Product {
  Product_id: number;
  Supplier_id: number;
  Category_id: number;
  Product_name: string;
  Price: number;
  Description: string;
  Warranty_period: number;
}

export class ProductModel {
  // Lấy tất cả sản phẩm
  static async getAll(): Promise<Product[]> {
    const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM Product");
    return rows as Product[];
  }

  // Lấy sản phẩm theo ID
  static async getById(id: number): Promise<Product | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM Product WHERE Product_id = ?",
      [id]
    );
    return rows.length > 0 ? (rows[0] as Product) : null;
  }

  // Lấy sản phẩm theo Category
  static async getByCategory(categoryId: number): Promise<Product[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM Product WHERE Category_id = ?",
      [categoryId]
    );
    return rows as Product[];
  }

  // Tạo sản phẩm mới
  static async create(product: Omit<Product, "Product_id">): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO Product (Supplier_id, Category_id, Product_name, Price, Description, Warranty_period) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        product.Supplier_id,
        product.Category_id,
        product.Product_name,
        product.Price,
        product.Description,
        product.Warranty_period,
      ]
    );
    return result.insertId;
  }

  // Cập nhật sản phẩm
  static async update(id: number, product: Partial<Product>): Promise<boolean> {
    const fields: string[] = [];
    const values: any[] = [];

    if (product.Supplier_id !== undefined) {
      fields.push("Supplier_id = ?");
      values.push(product.Supplier_id);
    }
    if (product.Category_id !== undefined) {
      fields.push("Category_id = ?");
      values.push(product.Category_id);
    }
    if (product.Product_name !== undefined) {
      fields.push("Product_name = ?");
      values.push(product.Product_name);
    }
    if (product.Price !== undefined) {
      fields.push("Price = ?");
      values.push(product.Price);
    }
    if (product.Description !== undefined) {
      fields.push("Description = ?");
      values.push(product.Description);
    }
    if (product.Warranty_period !== undefined) {
      fields.push("Warranty_period = ?");
      values.push(product.Warranty_period);
    }

    if (fields.length === 0) return false;

    values.push(id);
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE Product SET ${fields.join(", ")} WHERE Product_id = ?`,
      values
    );
    return result.affectedRows > 0;
  }

  // Xóa sản phẩm
  static async delete(id: number): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      "DELETE FROM Product WHERE Product_id = ?",
      [id]
    );
    return result.affectedRows > 0;
  }
}
