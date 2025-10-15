# Hướng dẫn tạo Database

## Tạo file .env thêm này vào

DB_HOST=localhost
DB_USER=user
DB_PASSWORD=password
DB_NAME=badminton_shop
DB_PORT=3306
PORT=8000

## Bước 1: Tạo database trong MySQL

Mở MySQL Workbench hoặc terminal và chạy:

```sql
CREATE DATABASE badminton_shop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## Bước 2: Import dữ liệu từ file SQLite.sql

### sử dụng terminal

```bash
mysql -u root -p badminton_shop < path/to/SQLite.sql
```

## Bước 3: Kiểm tra

Sau khi import, kiểm tra xem các bảng đã được tạo chưa:

```sql
USE badminton_shop;
SHOW TABLES;
```

Bạn sẽ thấy các bảng:

- AdminAccounts
- Cart
- CartItems
- Category
- Customer
- CustomerAccounts
- Employees
- Order
- OrderDetail
- Product
- Product_configuration
- Product_image
- Product_item
- PurchaseOrders
- Suppliers
- Variation
- Variation_options

## Bước 4: Khởi động lại server

```bash
npm run dev
```

Nếu thành công, bạn sẽ thấy:

```
✅ Kết nối database thành công!
🚀 Backend running at http://localhost:8000
```

## Test API

### Kiểm tra server:

```bash
curl http://localhost:8000
```

### Test API Products:

```bash
curl http://localhost:8000/api/products
```

backend/
├── src/
│ ├── config/
│ │ └── database.ts ✅ Kết nối database
│ ├── models/
│ │ └── Product.ts ✅ Model mẫu
│ ├── routes/
│ │ └── products.ts ✅ API routes
│ └── index.ts ✅ Server chính
└── .env ✅ Cấu hình DB
