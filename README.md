1. Cài đặt dependencies:
   ```bash
   cd backend
   npm install
   ```
2. Tạo database MySQL tên `badminton_shop` và import file `SQLite.sql`:
   ```sql
   CREATE DATABASE badminton_shop;
   -- Sau đó import file SQLite.sql vào database này đọc thêm trong SETUP_DATABASE.md
   ```
3. Tạo file `.env` trong thư mục `backend` với nội dung:
   ```env
   DB_HOST=localhost
   DB_USER=
   DB_PASSWORD=.
   DB_NAME=badminton_shop
   DB_PORT=3306
   PORT=8000
   ```
4. Chạy backend:
   ```bash
   npm run dev
   ```
5. (Frontend) Cài dependencies và chạy:
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```
