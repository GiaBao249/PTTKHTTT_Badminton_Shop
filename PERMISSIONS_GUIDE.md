# Hướng dẫn sử dụng hệ thống phân quyền

## Tổng quan

Hệ thống phân quyền được xây dựng dựa trên ERD với các bảng:
- `AdminAccounts`: Tài khoản admin
- `Roles`: Vai trò
- `Permissions`: Quyền (với code unique để check trong code)
- `Admin-Roles`: Liên kết admin với roles (many-to-many)
- `Role-Permissions`: Liên kết roles với permissions (many-to-many)

## Permission Code Format

Permission code được lưu dưới dạng `module:action` (VD: `product:create`, `user:delete`)

## Backend

### 1. Middleware Check Permission

```typescript
import { authRequired } from "../../middleware/authRequired";
import { checkPermission } from "../../middleware/checkPermission";

// Áp dụng cho route
router.post("/createProducts", 
  authRequired, 
  checkPermission("product:create"), 
  async (req, res) => {
    // Your code here
  }
);
```

### 2. API Endpoints

#### Lấy permissions của admin hiện tại
```
GET /api/admin/getPermissions
```

#### Quản lý Roles
```
GET    /api/admin/roles              # Lấy tất cả roles
POST   /api/admin/roles              # Tạo role mới
PUT    /api/admin/roles/:id          # Cập nhật role
DELETE /api/admin/roles/:id          # Xóa role
```

#### Quản lý Permissions
```
GET    /api/admin/permissions        # Lấy tất cả permissions
POST   /api/admin/permissions        # Tạo permission mới
PUT    /api/admin/permissions/:id    # Cập nhật permission
DELETE /api/admin/permissions/:id    # Xóa permission
```

#### Quản lý Admin Roles
```
GET  /api/admin/admin/:adminId/roles     # Lấy roles của admin
POST /api/admin/admin/:adminId/roles     # Gán roles cho admin
```

## Frontend

### 1. Hook usePermissions

```typescript
import { usePermissions, useHasPermission } from "../hook/usePermissions";

// Lấy tất cả permissions
const { data, isLoading } = usePermissions();

// Check permission cụ thể
const canCreate = useHasPermission("product:create");
```

### 2. Component RequirePermission

```typescript
import { RequirePermission } from "../Components";

// Chỉ hiển thị button nếu có permission
<RequirePermission permission="product:create">
  <button onClick={handleCreate}>Tạo sản phẩm</button>
</RequirePermission>

// Với fallback
<RequirePermission 
  permission="product:delete"
  fallback={<p>Bạn không có quyền xóa</p>}
>
  <button onClick={handleDelete}>Xóa</button>
</RequirePermission>
```

### 3. Ví dụ sử dụng

```typescript
import { useHasPermission } from "../hook/usePermissions";

const Products = () => {
  const canCreate = useHasPermission("product:create");
  const canEdit = useHasPermission("product:update");
  const canDelete = useHasPermission("product:delete");

  return (
    <div>
      {canCreate && (
        <button onClick={handleCreate}>Thêm sản phẩm</button>
      )}
      
      <RequirePermission permission="product:update">
        <button onClick={handleEdit}>Sửa</button>
      </RequirePermission>
    </div>
  );
};
```

## Permission Codes mẫu

### Product Management
- `product:create` - Tạo sản phẩm
- `product:read` - Xem sản phẩm
- `product:update` - Cập nhật sản phẩm
- `product:delete` - Xóa sản phẩm

### Purchase Order Management
- `purchase_order:create` - Tạo phiếu nhập
- `purchase_order:read` - Xem phiếu nhập
- `purchase_order:update` - Cập nhật phiếu nhập
- `purchase_order:delete` - Xóa phiếu nhập

### Order Management
- `order:read` - Xem đơn hàng
- `order:update` - Cập nhật đơn hàng

### User Management
- `user:read` - Xem người dùng
- `user:create` - Tạo người dùng
- `user:update` - Cập nhật người dùng
- `user:delete` - Xóa người dùng

### Role & Permission Management
- `role:read` - Xem roles
- `role:create` - Tạo role
- `role:update` - Cập nhật role
- `role:delete` - Xóa role
- `permission:read` - Xem permissions
- `permission:manage` - Quản lý permissions

