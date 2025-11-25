-- Script SQL để tạo TẤT CẢ permissions cho hệ thống
-- Chạy trong Supabase SQL Editor

-- Xóa các permissions cũ (nếu cần reset)
-- DELETE FROM role_permissions;
-- DELETE FROM permissions;

-- 1. Tạo các permissions cho module PRODUCT
INSERT INTO permissions (code, name, module) VALUES
  ('product:create', 'Tạo sản phẩm', 'product'),
  ('product:read', 'Xem sản phẩm', 'product'),
  ('product:update', 'Cập nhật sản phẩm', 'product'),
  ('product:delete', 'Xóa sản phẩm', 'product')
ON CONFLICT (code) DO NOTHING;

-- 2. Tạo các permissions cho module ORDER
INSERT INTO permissions (code, name, module) VALUES
  ('order:read', 'Xem đơn hàng', 'order'),
  ('order:read:detail', 'Xem chi tiết đơn hàng', 'order'),
  ('order:update', 'Cập nhật đơn hàng', 'order')
ON CONFLICT (code) DO NOTHING;

-- 3. Tạo các permissions cho module PURCHASE_ORDER
INSERT INTO permissions (code, name, module) VALUES
  ('purchase_order:create', 'Tạo phiếu nhập', 'purchase_order'),
  ('purchase_order:read', 'Xem phiếu nhập', 'purchase_order'),
  ('purchase_order:read:detail', 'Xem chi tiết phiếu nhập', 'purchase_order')
ON CONFLICT (code) DO NOTHING;

-- 4. Tạo các permissions cho module CUSTOMER
INSERT INTO permissions (code, name, module) VALUES
  ('customer:read', 'Xem khách hàng', 'customer')
ON CONFLICT (code) DO NOTHING;

-- 5. Tạo các permissions cho module INVOICE
INSERT INTO permissions (code, name, module) VALUES
  ('invoice:read', 'Xem hóa đơn', 'invoice'),
  ('invoice:read:detail', 'Xem chi tiết hóa đơn', 'invoice')
ON CONFLICT (code) DO NOTHING;

-- 6. Tạo các permissions cho module DASHBOARD
INSERT INTO permissions (code, name, module) VALUES
  ('dashboard:read', 'Xem dashboard', 'dashboard'),
  ('dashboard:read:recent_orders', 'Xem đơn hàng gần đây', 'dashboard'),
  ('dashboard:read:top_products', 'Xem sản phẩm bán chạy', 'dashboard')
ON CONFLICT (code) DO NOTHING;

-- 7. Tạo các permissions cho module CATEGORY
INSERT INTO permissions (code, name, module) VALUES
  ('category:read', 'Xem danh mục', 'category')
ON CONFLICT (code) DO NOTHING;

-- 8. Tạo các permissions cho module SUPPLIER
INSERT INTO permissions (code, name, module) VALUES
  ('supplier:read', 'Xem nhà cung cấp', 'supplier')
ON CONFLICT (code) DO NOTHING;

-- 9. Tạo các permissions cho module EMPLOYEE
INSERT INTO permissions (code, name, module) VALUES
  ('employee:read', 'Xem nhân viên', 'employee')
ON CONFLICT (code) DO NOTHING;

-- 10. Tạo các permissions cho module ROLE
INSERT INTO permissions (code, name, module) VALUES
  ('role:read', 'Xem vai trò', 'role'),
  ('role:create', 'Tạo vai trò', 'role'),
  ('role:update', 'Cập nhật vai trò', 'role'),
  ('role:delete', 'Xóa vai trò', 'role')
ON CONFLICT (code) DO NOTHING;

-- 11. Tạo các permissions cho module PERMISSION
INSERT INTO permissions (code, name, module) VALUES
  ('permission:read', 'Xem quyền', 'permission'),
  ('permission:manage', 'Quản lý quyền', 'permission')
ON CONFLICT (code) DO NOTHING;

-- 12. Tạo các permissions cho module ADMIN_ROLE
INSERT INTO permissions (code, name, module) VALUES
  ('admin_role:read', 'Xem quyền admin', 'admin_role'),
  ('admin_role:update', 'Gán quyền cho admin', 'admin_role')
ON CONFLICT (code) DO NOTHING;

-- 13. Tạo role Super Admin
INSERT INTO roles (name, description) VALUES
  ('Super Admin', 'Toàn quyền quản trị hệ thống')
ON CONFLICT DO NOTHING;

-- 14. Gán TẤT CẢ permissions cho Super Admin role
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  (SELECT id FROM roles WHERE name = 'Super Admin'),
  id
FROM permissions
ON CONFLICT DO NOTHING;

-- 15. Tạo các roles thông dụng khác
INSERT INTO roles (name, description) VALUES
  ('Product Manager', 'Quản lý sản phẩm'),
  ('Order Manager', 'Quản lý đơn hàng'),
  ('Inventory Manager', 'Quản lý kho hàng'),
  ('View Only', 'Chỉ xem dữ liệu')
ON CONFLICT DO NOTHING;

-- 16. Gán permissions cho Product Manager
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  (SELECT id FROM roles WHERE name = 'Product Manager'),
  id
FROM permissions
WHERE code IN (
  'product:create',
  'product:read',
  'product:update',
  'product:delete',
  'category:read',
  'supplier:read',
  'dashboard:read'
)
ON CONFLICT DO NOTHING;

-- 17. Gán permissions cho Order Manager
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  (SELECT id FROM roles WHERE name = 'Order Manager'),
  id
FROM permissions
WHERE code IN (
  'order:read',
  'order:read:detail',
  'order:update',
  'customer:read',
  'invoice:read',
  'invoice:read:detail',
  'dashboard:read'
)
ON CONFLICT DO NOTHING;

-- 18. Gán permissions cho Inventory Manager
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  (SELECT id FROM roles WHERE name = 'Inventory Manager'),
  id
FROM permissions
WHERE code IN (
  'purchase_order:create',
  'purchase_order:read',
  'purchase_order:read:detail',
  'product:read',
  'supplier:read',
  'dashboard:read'
)
ON CONFLICT DO NOTHING;

-- 19. Gán permissions cho View Only
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  (SELECT id FROM roles WHERE name = 'View Only'),
  id
FROM permissions
WHERE code IN (
  'dashboard:read',
  'product:read',
  'order:read',
  'customer:read'
)
ON CONFLICT DO NOTHING;

-- 20. Gán Super Admin role cho admin đầu tiên
-- THAY ĐỔI số 1 thành employee_id của admin bạn đang đăng nhập
INSERT INTO admin_roles (admin_account_id, role_id)
SELECT 
  1, -- THAY ĐỔI thành adminaccounts.id (KHÔNG phải employee_id) của bạn
  -- Để tìm admin_account_id: SELECT id, username, employee_id FROM adminaccounts;
  id
FROM roles 
WHERE name = 'Super Admin'
ON CONFLICT DO NOTHING;

-- 21. Kiểm tra kết quả
SELECT 
  p.module,
  COUNT(*) as total_permissions,
  STRING_AGG(p.code, ', ' ORDER BY p.code) as permission_codes
FROM permissions p
GROUP BY p.module
ORDER BY p.module;

-- 22. Xem tất cả roles và số lượng permissions
SELECT 
  r.id,
  r.name,
  r.description,
  COUNT(rp.permission_id) as permission_count
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
GROUP BY r.id, r.name, r.description
ORDER BY r.name;

-- 23. Xem permissions của một admin cụ thể
SELECT 
  ar.admin_account_id,
  r.name as role_name,
  COUNT(p.id) as permission_count,
  STRING_AGG(p.code, ', ' ORDER BY p.code) as permissions
FROM admin_roles ar
JOIN roles r ON ar.role_id = r.id
LEFT JOIN role_permissions rp ON r.id = rp.role_id
LEFT JOIN permissions p ON rp.permission_id = p.id
GROUP BY ar.admin_account_id, r.name;

