# Danh Sách Module và Actions cho Hệ Thống Phân Quyền

## Format Permission Code
```
{module}:{action}
```

## Các Actions Chuẩn

| Action | Mô tả | Ví dụ |
|--------|-------|-------|
| `create` | Tạo mới | `product:create` |
| `read` | Xem/Đọc dữ liệu | `product:read` |
| `update` | Cập nhật dữ liệu | `product:update` |
| `delete` | Xóa dữ liệu | `product:delete` |
| `manage` | Quản lý toàn diện (CRUD + các thao tác đặc biệt) | `permission:manage` |

---

## Danh Sách Modules và Permissions

### 1. Module: `product` (Sản phẩm)

| Permission Code | Tên Permission | Mô tả | Route/Endpoint |
|----------------|----------------|-------|----------------|
| `product:create` | Tạo sản phẩm | Cho phép tạo sản phẩm mới | `POST /api/admin/createProducts` |
| `product:read` | Xem sản phẩm | Cho phép xem danh sách sản phẩm | `GET /api/admin/getProducts` |
| `product:update` | Cập nhật sản phẩm | Cho phép chỉnh sửa thông tin sản phẩm | `PUT /api/admin/updateProduct/:id` |
| `product:delete` | Xóa sản phẩm | Cho phép xóa sản phẩm | `DELETE /api/admin/deleteProduct/:id` |

### 2. Module: `order` (Đơn hàng)

| Permission Code | Tên Permission | Mô tả | Route/Endpoint |
|----------------|----------------|-------|----------------|
| `order:read` | Xem đơn hàng | Cho phép xem danh sách đơn hàng | `GET /api/admin/getOrders` |
| `order:read:detail` | Xem chi tiết đơn hàng | Cho phép xem thông tin chi tiết đơn hàng | `GET /api/admin/getOrdersDetail` |
| `order:update` | Cập nhật đơn hàng | Cho phép cập nhật trạng thái đơn hàng | `PATCH /api/admin/updateOrderStatus` |

### 3. Module: `purchase_order` (Phiếu nhập)

| Permission Code | Tên Permission | Mô tả | Route/Endpoint |
|----------------|----------------|-------|----------------|
| `purchase_order:create` | Tạo phiếu nhập | Cho phép tạo phiếu nhập mới | `POST /api/admin/createPurchaseOrder` |
| `purchase_order:read` | Xem phiếu nhập | Cho phép xem danh sách phiếu nhập | `GET /api/admin/getPurchaseOrders` |
| `purchase_order:read:detail` | Xem chi tiết phiếu nhập | Cho phép xem thông tin chi tiết phiếu nhập | `GET /api/admin/getPurchaseOrderDetail/:id` |

### 4. Module: `customer` (Khách hàng)

| Permission Code | Tên Permission | Mô tả | Route/Endpoint |
|----------------|----------------|-------|----------------|
| `customer:read` | Xem khách hàng | Cho phép xem danh sách khách hàng | `GET /api/admin/getCustomers` |

### 5. Module: `invoice` (Hóa đơn)

| Permission Code | Tên Permission | Mô tả | Route/Endpoint |
|----------------|----------------|-------|----------------|
| `invoice:read` | Xem hóa đơn | Cho phép xem danh sách hóa đơn | `GET /api/admin/getInvoices` |
| `invoice:read:detail` | Xem chi tiết hóa đơn | Cho phép xem chi tiết hóa đơn | `GET /api/admin/getInvoice/:id` |

### 6. Module: `dashboard` (Tổng quan)

| Permission Code | Tên Permission | Mô tả | Route/Endpoint |
|----------------|----------------|-------|----------------|
| `dashboard:read` | Xem dashboard | Cho phép xem thống kê tổng quan | `GET /api/admin/getDashBoardStats` |
| `dashboard:read:recent_orders` | Xem đơn hàng gần đây | Cho phép xem danh sách đơn hàng gần đây | `GET /api/admin/getRecentOrders` |
| `dashboard:read:top_products` | Xem sản phẩm bán chạy | Cho phép xem top sản phẩm bán chạy | `GET /api/admin/getTopSellingProducts` |

### 7. Module: `category` (Danh mục)

| Permission Code | Tên Permission | Mô tả | Route/Endpoint |
|----------------|----------------|-------|----------------|
| `category:read` | Xem danh mục | Cho phép xem danh sách danh mục | `GET /api/admin/getCategories` |

### 8. Module: `supplier` (Nhà cung cấp)

| Permission Code | Tên Permission | Mô tả | Route/Endpoint |
|----------------|----------------|-------|----------------|
| `supplier:read` | Xem nhà cung cấp | Cho phép xem danh sách nhà cung cấp | `GET /api/admin/getSuppliers` |

### 9. Module: `employee` (Nhân viên)

| Permission Code | Tên Permission | Mô tả | Route/Endpoint |
|----------------|----------------|-------|----------------|
| `employee:read` | Xem nhân viên | Cho phép xem danh sách nhân viên | `GET /api/admin/getEmployees` |

### 10. Module: `role` (Vai trò)

| Permission Code | Tên Permission | Mô tả | Route/Endpoint |
|----------------|----------------|-------|----------------|
| `role:read` | Xem vai trò | Cho phép xem danh sách vai trò | `GET /api/admin/roles` |
| `role:create` | Tạo vai trò | Cho phép tạo vai trò mới | `POST /api/admin/roles` |
| `role:update` | Cập nhật vai trò | Cho phép chỉnh sửa vai trò | `PUT /api/admin/roles/:id` |
| `role:delete` | Xóa vai trò | Cho phép xóa vai trò | `DELETE /api/admin/roles/:id` |

### 11. Module: `permission` (Quyền)

| Permission Code | Tên Permission | Mô tả | Route/Endpoint |
|----------------|----------------|-------|----------------|
| `permission:read` | Xem quyền | Cho phép xem danh sách quyền | `GET /api/admin/permissions` |
| `permission:manage` | Quản lý quyền | Cho phép tạo/sửa/xóa quyền | `POST/PUT/DELETE /api/admin/permissions` |

### 12. Module: `admin_role` (Gán quyền cho Admin)

| Permission Code | Tên Permission | Mô tả | Route/Endpoint |
|----------------|----------------|-------|----------------|
| `admin_role:read` | Xem quyền admin | Cho phép xem roles của admin | `GET /api/admin/admin/:adminId/roles` |
| `admin_role:update` | Gán quyền cho admin | Cho phép gán/xóa roles cho admin | `POST /api/admin/admin/:adminId/roles` |

---

## Tổng Kết

### Tổng số Modules: 12
1. product
2. order
3. purchase_order
4. customer
5. invoice
6. dashboard
7. category
8. supplier
9. employee
10. role
11. permission
12. admin_role

### Tổng số Permissions: ~25

---

## Gợi Ý Các Roles Thông Dụng

### 1. Super Admin
- **Mô tả**: Toàn quyền hệ thống
- **Permissions**: Tất cả permissions

### 2. Product Manager
- **Mô tả**: Quản lý sản phẩm
- **Permissions**: 
  - `product:*`
  - `category:read`
  - `supplier:read`
  - `dashboard:read`

### 3. Order Manager
- **Mô tả**: Quản lý đơn hàng
- **Permissions**:
  - `order:*`
  - `customer:read`
  - `invoice:*`
  - `dashboard:read`

### 4. Inventory Manager
- **Mô tả**: Quản lý kho
- **Permissions**:
  - `purchase_order:*`
  - `product:read`
  - `supplier:read`
  - `dashboard:read`

### 5. View Only (Chỉ xem)
- **Mô tả**: Chỉ được xem dữ liệu
- **Permissions**:
  - `dashboard:read`
  - `product:read`
  - `order:read`
  - `customer:read`

---

## SQL Script để Tạo Tất Cả Permissions

Xem file: `setup_all_permissions.sql`

