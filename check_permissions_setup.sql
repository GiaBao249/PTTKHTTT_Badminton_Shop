-- Script để kiểm tra và sửa lỗi phân quyền
-- Chạy trong Supabase SQL Editor

-- 1. Kiểm tra cấu trúc các bảng
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name IN ('admin_roles', 'role_permissions', 'roles', 'permissions', 'adminaccounts')
ORDER BY table_name, ordinal_position;

-- 2. Kiểm tra dữ liệu hiện tại
-- Xem tất cả admin accounts
SELECT id, username, employee_id FROM adminaccounts ORDER BY id;

-- Xem tất cả roles
SELECT id, name, description FROM roles ORDER BY id;

-- Xem tất cả permissions
SELECT id, code, name, module FROM permissions ORDER BY module, code;

-- Xem admin_roles (liên kết admin với roles)
SELECT 
    ar.admin_account_id,
    ar.role_id,
    a.username,
    r.name as role_name
FROM admin_roles ar
LEFT JOIN adminaccounts a ON ar.admin_account_id = a.id
LEFT JOIN roles r ON ar.role_id = r.id
ORDER BY ar.admin_account_id, ar.role_id;

-- Xem role_permissions (liên kết roles với permissions)
SELECT 
    rp.role_id,
    rp.permission_id,
    r.name as role_name,
    p.code as permission_code,
    p.name as permission_name
FROM role_permissions rp
LEFT JOIN roles r ON rp.role_id = r.id
LEFT JOIN permissions p ON rp.permission_id = p.id
ORDER BY rp.role_id, rp.permission_id;

-- 3. Kiểm tra permissions của một admin cụ thể
-- THAY ĐỔI admin_account_id = 1 thành ID của admin bạn muốn kiểm tra
SELECT 
    a.id as admin_account_id,
    a.username,
    r.id as role_id,
    r.name as role_name,
    p.id as permission_id,
    p.code as permission_code,
    p.name as permission_name,
    p.module
FROM adminaccounts a
LEFT JOIN admin_roles ar ON a.id = ar.admin_account_id
LEFT JOIN roles r ON ar.role_id = r.id
LEFT JOIN role_permissions rp ON r.id = rp.role_id
LEFT JOIN permissions p ON rp.permission_id = p.id
WHERE a.id = 1  -- THAY ĐỔI thành admin_account_id của bạn
ORDER BY r.name, p.module, p.code;

-- 4. Kiểm tra xem có admin nào chưa có roles không
SELECT 
    a.id,
    a.username,
    COUNT(ar.role_id) as role_count
FROM adminaccounts a
LEFT JOIN admin_roles ar ON a.id = ar.admin_account_id
GROUP BY a.id, a.username
HAVING COUNT(ar.role_id) = 0;

-- 5. Kiểm tra xem có role nào chưa có permissions không
SELECT 
    r.id,
    r.name,
    COUNT(rp.permission_id) as permission_count
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
GROUP BY r.id, r.name
HAVING COUNT(rp.permission_id) = 0;

-- 6. Sửa lỗi: Gán Super Admin role cho admin đầu tiên (nếu chưa có)
-- THAY ĐỔI số 1 thành admin_account_id của bạn
INSERT INTO admin_roles (admin_account_id, role_id)
SELECT 
    1, -- THAY ĐỔI thành adminaccounts.id của bạn
    (SELECT id FROM roles WHERE name = 'Super Admin' LIMIT 1)
WHERE NOT EXISTS (
    SELECT 1 FROM admin_roles 
    WHERE admin_account_id = 1 
    AND role_id = (SELECT id FROM roles WHERE name = 'Super Admin' LIMIT 1)
);

-- 7. Kiểm tra lại sau khi sửa
SELECT 
    a.id,
    a.username,
    r.name as role_name,
    COUNT(DISTINCT p.id) as permission_count
FROM adminaccounts a
LEFT JOIN admin_roles ar ON a.id = ar.admin_account_id
LEFT JOIN roles r ON ar.role_id = r.id
LEFT JOIN role_permissions rp ON r.id = rp.role_id
LEFT JOIN permissions p ON rp.permission_id = p.id
WHERE a.id = 1  -- THAY ĐỔI thành admin_account_id của bạn
GROUP BY a.id, a.username, r.name;

