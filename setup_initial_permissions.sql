-- Script SQL để setup hệ thống phân quyền ban đầu
-- Chạy trong Supabase SQL Editor

-- 1. Tạo các permissions cơ bản
INSERT INTO permissions (code, name, module) VALUES
  -- Product permissions
  ('product:create', 'Tạo sản phẩm', 'product'),
  ('product:read', 'Xem sản phẩm', 'product'),
  ('product:update', 'Cập nhật sản phẩm', 'product'),
  ('product:delete', 'Xóa sản phẩm', 'product'),
  
  -- Order permissions
  ('order:read', 'Xem đơn hàng', 'order'),
  ('order:update', 'Cập nhật đơn hàng', 'order'),
  
  -- Purchase Order permissions
  ('purchase_order:create', 'Tạo phiếu nhập', 'purchase_order'),
  ('purchase_order:read', 'Xem phiếu nhập', 'purchase_order'),
  
  -- Role permissions
  ('role:read', 'Xem vai trò', 'role'),
  ('role:create', 'Tạo vai trò', 'role'),
  ('role:update', 'Cập nhật vai trò', 'role'),
  ('role:delete', 'Xóa vai trò', 'role'),
  
  -- Permission permissions
  ('permission:read', 'Xem quyền', 'permission'),
  ('permission:manage', 'Quản lý quyền', 'permission')
ON CONFLICT (code) DO NOTHING;

-- 2. Tạo role Super Admin
INSERT INTO roles (name, description) VALUES
  ('Super Admin', 'Toàn quyền quản trị hệ thống')
ON CONFLICT DO NOTHING;

-- 3. Gán TẤT CẢ permissions cho Super Admin role
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  (SELECT id FROM roles WHERE name = 'Super Admin'),
  id
FROM permissions
ON CONFLICT DO NOTHING;

-- 4. Gán Super Admin role cho admin đầu tiên
-- THAY ĐỔI số 1 thành employee_id của admin bạn đang đăng nhập
-- Kiểm tra employee_id bằng cách xem trong bảng adminaccounts hoặc employees
INSERT INTO admin_roles (admin_account_id, role_id)
SELECT 
  1, -- THAY ĐỔI thành employee_id của bạn
  id
FROM roles 
WHERE name = 'Super Admin'
ON CONFLICT DO NOTHING;

-- 5. Kiểm tra kết quả
SELECT 
  ar.admin_account_id,
  r.name as role_name,
  COUNT(p.id) as permission_count
FROM admin_roles ar
JOIN roles r ON ar.role_id = r.id
LEFT JOIN role_permissions rp ON r.id = rp.role_id
LEFT JOIN permissions p ON rp.permission_id = p.id
GROUP BY ar.admin_account_id, r.name;

