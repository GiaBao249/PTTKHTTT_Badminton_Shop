# Cấu trúc dữ liệu mẫu cho hệ thống phân quyền

## 1. BẢNG PERMISSIONS

### Dữ liệu mẫu:

| id | code | name | module |
|----|------|------|--------|
| 1 | product:create | Tạo sản phẩm | product |
| 2 | product:read | Xem sản phẩm | product |
| 3 | product:update | Cập nhật sản phẩm | product |
| 4 | product:delete | Xóa sản phẩm | product |
| 5 | order:read | Xem đơn hàng | order |
| 6 | order:read:detail | Xem chi tiết đơn hàng | order |
| 7 | order:update | Cập nhật đơn hàng | order |
| 8 | purchase_order:create | Tạo phiếu nhập | purchase_order |
| 9 | purchase_order:read | Xem phiếu nhập | purchase_order |
| 10 | purchase_order:read:detail | Xem chi tiết phiếu nhập | purchase_order |
| 11 | customer:read | Xem khách hàng | customer |
| 12 | customer:view | Xem thông tin khách hàng | customer |
| 13 | invoice:read | Xem hóa đơn | invoice |
| 14 | invoice:read:detail | Xem chi tiết hóa đơn | invoice |
| 15 | dashboard:read | Xem dashboard | dashboard |
| 16 | dashboard:read:recent_orders | Xem đơn hàng gần đây | dashboard |
| 17 | dashboard:read:top_products | Xem sản phẩm bán chạy | dashboard |
| 18 | category:read | Xem danh mục | category |
| 19 | supplier:read | Xem nhà cung cấp | supplier |
| 20 | employee:read | Xem nhân viên | employee |
| 21 | role:read | Xem vai trò | role |
| 22 | role:create | Tạo vai trò | role |
| 23 | role:update | Cập nhật vai trò | role |
| 24 | role:delete | Xóa vai trò | role |
| 25 | permission:read | Xem quyền | permission |
| 26 | permission:manage | Quản lý quyền | permission |
| 27 | admin_role:read | Xem quyền admin | admin_role |
| 28 | admin_role:update | Gán quyền cho admin | admin_role |

---

## 2. BẢNG ROLES

### Dữ liệu mẫu:

| id | name | description |
|----|------|-------------|
| 1 | Super Admin | Quản trị viên cao cấp, có full quyền |
| 2 | Warehouse Manager | Quản lý kho, chuyên nhập hàng và quản lý tồn kho |
| 3 | Sales Staff | Nhân viên kinh doanh, chuyên xử lý đơn hàng |
| 4 | Content Editor | Chỉ vào để sửa bài viết, hình ảnh sản phẩm |

---

## 3. BẢNG ROLE_PERMISSIONS

### Gán permissions cho Super Admin (role_id = 1):
- **TẤT CẢ** permissions (1-28)

### Gán permissions cho Warehouse Manager (role_id = 2):
- purchase_order:create
- purchase_order:read
- purchase_order:read:detail
- product:read
- product:update
- supplier:read
- dashboard:read
- category:read

### Gán permissions cho Sales Staff (role_id = 3):
- order:read
- order:read:detail
- order:update
- customer:read
- customer:view
- invoice:read
- invoice:read:detail
- product:read
- dashboard:read
- dashboard:read:recent_orders

### Gán permissions cho Content Editor (role_id = 4):
- product:read
- product:update
- category:read
- dashboard:read

### Ví dụ dữ liệu trong bảng role_permissions:

| role_id | permission_id |
|---------|---------------|
| 1 | 1 (Super Admin có tất cả) |
| 1 | 2 |
| 1 | 3 |
| ... | ... |
| 1 | 28 |
| 2 | 8 (Warehouse Manager) |
| 2 | 9 |
| 2 | 10 |
| ... | ... |
| 3 | 5 (Sales Staff) |
| 3 | 6 |
| ... | ... |

---

## 4. BẢNG ADMIN_ROLES

### Dữ liệu mẫu:

| admin_account_id | role_id |
|------------------|---------|
| 1 | 1 (Super Admin) |

**LƯU Ý QUAN TRỌNG:**
- `admin_account_id` phải là `adminaccounts.id` (KHÔNG phải `employee_id`)
- Để tìm `admin_account_id`: 
  ```sql
  SELECT id, username, employee_id FROM adminaccounts;
  ```

---

## 5. QUAN HỆ GIỮA CÁC BẢNG

```
adminaccounts (id)
    ↓
admin_roles (admin_account_id, role_id)
    ↓
roles (id, name)
    ↓
role_permissions (role_id, permission_id)
    ↓
permissions (id, code, name, module)
```

### Luồng kiểm tra permission:
1. Admin đăng nhập → JWT token chứa `adminaccounts.id`
2. Query `admin_roles` → Lấy các `role_id` của admin
3. Query `role_permissions` → Lấy các `permission_id` của các roles
4. Query `permissions` → Lấy `code` của permissions
5. Kiểm tra xem `code` có khớp với permission cần check không

---

## 6. CÁCH SỬ DỤNG

### Chạy script SQL:
1. Mở Supabase SQL Editor
2. Copy toàn bộ nội dung file `insert_sample_data_permissions.sql`
3. **QUAN TRỌNG**: Thay đổi `admin_account_id = 1` thành ID của admin bạn
4. Paste và chạy script
5. Kiểm tra kết quả ở phần cuối script

### Kiểm tra dữ liệu:
```sql
-- Xem tất cả permissions
SELECT * FROM permissions ORDER BY module, code;

-- Xem tất cả roles
SELECT * FROM roles ORDER BY id;

-- Xem role_permissions
SELECT rp.*, r.name as role_name, p.code as permission_code
FROM role_permissions rp
JOIN roles r ON rp.role_id = r.id
JOIN permissions p ON rp.permission_id = p.id
ORDER BY r.name, p.code;

-- Xem admin_roles
SELECT ar.*, a.username, r.name as role_name
FROM admin_roles ar
JOIN adminaccounts a ON ar.admin_account_id = a.id
JOIN roles r ON ar.role_id = r.id;
```

---

## 7. TROUBLESHOOTING

### Nếu admin không có permissions:
1. Kiểm tra `admin_roles`: `SELECT * FROM admin_roles WHERE admin_account_id = ?`
2. Kiểm tra `role_permissions`: `SELECT * FROM role_permissions WHERE role_id = ?`
3. Kiểm tra `permissions`: `SELECT * FROM permissions WHERE code = 'dashboard:read'`

### Nếu role không có permissions:
1. Chạy lại phần gán permissions trong script
2. Kiểm tra foreign key constraints
3. Kiểm tra xem permissions có tồn tại không

