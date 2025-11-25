# Hướng dẫn Setup Permissions và Roles

## Bước 1: Tìm admin_account_id của bạn

Trong Supabase SQL Editor, chạy query sau để tìm `adminaccounts.id` (KHÔNG phải `employee_id`):

```sql
SELECT id, username, employee_id FROM adminaccounts;
```

Ghi lại `id` (đây là `admin_account_id` cần dùng).

## Bước 2: Chạy SQL Script để tạo Permissions và Roles

1. Mở file `setup_all_permissions.sql` trong Supabase SQL Editor
2. Tìm dòng 171: `INSERT INTO admin_roles (admin_account_id, role_id)`
3. Thay đổi số `1` thành `admin_account_id` của bạn (từ Bước 1)
4. Chạy toàn bộ script

## Bước 3: Đăng nhập lại để nhận token mới

**QUAN TRỌNG:** Sau khi setup permissions, bạn **PHẢI đăng nhập lại** để nhận JWT token mới chứa `adminaccounts.id` (không phải `employee_id`).

Token cũ sẽ không hoạt động với hệ thống phân quyền mới.

## Bước 4: Kiểm tra Permissions

Sau khi đăng nhập lại, kiểm tra xem bạn có thể truy cập các trang admin không. Nếu vẫn bị lỗi 403:

1. Kiểm tra logs ở backend console để xem `admin_account_id` là gì
2. Kiểm tra xem role đã được gán cho admin account chưa:
   ```sql
   SELECT ar.admin_account_id, r.name as role_name
   FROM admin_roles ar
   JOIN roles r ON ar.role_id = r.id
   WHERE ar.admin_account_id = YOUR_ADMIN_ACCOUNT_ID;
   ```

3. Kiểm tra xem role có permissions chưa:
   ```sql
   SELECT r.name, COUNT(p.id) as permission_count
   FROM roles r
   JOIN role_permissions rp ON r.id = rp.role_id
   JOIN permissions p ON rp.permission_id = p.id
   WHERE r.name = 'Super Admin'
   GROUP BY r.name;
   ```

## Troubleshooting

### Lỗi 403 Forbidden

- **Nguyên nhân 1:** Đang dùng token cũ (chứa `employee_id`)
  - **Giải pháp:** Đăng nhập lại để nhận token mới

- **Nguyên nhân 2:** Admin account chưa có roles
  - **Giải pháp:** Chạy lại SQL script để gán role (Bước 2)

- **Nguyên nhân 3:** Role chưa có permissions
  - **Giải pháp:** Kiểm tra bằng query trong Bước 4

### Lỗi "Admin không có quyền truy cập"

- Kiểm tra xem bạn đã gán role cho admin account chưa
- Kiểm tra xem role đó có permissions cần thiết chưa

