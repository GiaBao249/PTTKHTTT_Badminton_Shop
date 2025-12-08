import express from "express";
import { container } from "tsyringe";
import { authRequired } from "../middleware/authRequired";
import { requireAdminRole } from "../middleware/requireAdminRole";
import { checkPermission } from "../middleware/checkPermission";
import { CategoryController } from "../controllers/CategoryController";
import { SupplierController } from "../controllers/SupplierController";
import { EmployeeController } from "../controllers/EmployeeController";
import { AdminAccountController } from "../controllers/AdminAccountController";
import { CustomerController } from "../controllers/CustomerController";
import { OrderController } from "../controllers/RecentOrderController";
import { DashboardController } from "../controllers/DashboardController";
import { TopSellingProductController } from "../controllers/TopSellingProductController";
import { InvoiceController } from "../controllers/InvoiceController";
import { StatisticsController } from "../controllers/StatisticsController";
import { ProductController } from "../controllers/ProductController";
import { PurchaseOrderController } from "../controllers/PurchaseOrderController";
import { PermissionController } from "../controllers/PermissionController";
import { ImageController } from "../controllers/ImageController";

const router = express.Router();

// ========== RESOLVE DEPENDENCIES TỪ CONTAINER ==========
const categoryController = container.resolve(CategoryController);
const supplierController = container.resolve(SupplierController);
const employeeController = container.resolve(EmployeeController);
const adminAccountController = container.resolve(AdminAccountController);
const customerController = container.resolve(CustomerController);
const recentOrderController = container.resolve(OrderController);
const dashboardController = container.resolve(DashboardController);
const invoiceController = container.resolve(InvoiceController);
const statisticsController = container.resolve(StatisticsController);
const topSellingProductController = container.resolve(
  TopSellingProductController
);
const productController = container.resolve(ProductController);
const purchaseOrderController = container.resolve(PurchaseOrderController);
const permissionController = container.resolve(PermissionController);
const imageController = container.resolve(ImageController);

// ========== MIDDLEWARE: AUTHENTICATION ==========
// Áp dụng authRequired cho TẤT CẢ routes admin (yêu cầu JWT token)
router.use(authRequired);

// ========== ROUTE ĐẶC BIỆT: GET PERMISSIONS ==========
// Route này KHÔNG cần requireAdminRole vì admin cần xem permissions của mình
// ngay cả khi chưa được gán roles (để biết mình có quyền gì)
// GET /api/admin/getPermissions - Lấy permissions của admin hiện tại
router.get("/getPermissions", permissionController.getPermissions);

// ========== MIDDLEWARE: AUTHORIZATION ==========
// Áp dụng requireAdminRole cho TẤT CẢ routes còn lại
// Admin phải có ít nhất một role mới được truy cập các routes dưới đây
router.use(requireAdminRole);

// ========== PERMISSION & ROLE ROUTES ==========
// Quản lý Roles
// GET /api/admin/roles - Lấy tất cả roles với permissions
router.get(
  "/roles",
  checkPermission("role:read"),
  permissionController.getAllRoles
);

// POST /api/admin/roles - Tạo role mới
router.post(
  "/roles",
  checkPermission("role:create"),
  permissionController.createRole
);

// PUT /api/admin/roles/:id - Cập nhật role
router.put(
  "/roles/:id",
  checkPermission("role:update"),
  permissionController.updateRole
);

// DELETE /api/admin/roles/:id - Xóa role (cascade delete: xóa role_permissions và admin_roles)
router.delete(
  "/roles/:id",
  checkPermission("role:delete"),
  permissionController.deleteRole
);

// Quản lý Permissions
// GET /api/admin/permissions - Lấy tất cả permissions
router.get(
  "/permissions",
  checkPermission("permission:read"),
  permissionController.getAllPermissions
);

// POST /api/admin/permissions - Tạo permission mới
router.post(
  "/permissions",
  checkPermission("permission:manage"),
  permissionController.createPermission
);

// PUT /api/admin/permissions/:id - Cập nhật permission
router.put(
  "/permissions/:id",
  checkPermission("permission:manage"),
  permissionController.updatePermission
);

// DELETE /api/admin/permissions/:id - Xóa permission (cascade delete: xóa role_permissions)
router.delete(
  "/permissions/:id",
  checkPermission("permission:manage"),
  permissionController.deletePermission
);

// Quản lý Admin Roles (Gán roles cho admin)
// GET /api/admin/admin/:adminId/roles - Lấy roles của một admin
router.get(
  "/admin/:adminId/roles",
  checkPermission("admin_role:read"),
  permissionController.getAdminRoles
);

// POST /api/admin/admin/:adminId/roles - Gán roles cho admin (replace tất cả roles cũ)
router.post(
  "/admin/:adminId/roles",
  checkPermission("admin_role:update"),
  permissionController.assignRolesToAdmin
);

// ========== CATEGORY ROUTES (Layered Architecture với TSyringe) ==========
// GET /api/admin/getCategories - Lấy tất cả categories
router.get(
  "/getCategories",
  checkPermission("category:read"),
  categoryController.getAllCategories
);

// GET /api/admin/categories/:id - Lấy category theo ID
router.get(
  "/categories/:id",
  checkPermission("category:read"),
  categoryController.getCategoryById
);

// POST /api/admin/categories - Tạo category mới
router.post(
  "/categories",
  checkPermission("category:create"),
  categoryController.createCategory
);

// PUT /api/admin/categories/:id - Cập nhật category
router.put(
  "/categories/:id",
  checkPermission("category:update"),
  categoryController.updateCategory
);

// DELETE /api/admin/categories/:id - Xóa category
router.delete(
  "/categories/:id",
  checkPermission("category:delete"),
  categoryController.deleteCategory
);

// ========== SUPPLIER ROUTES (Layered Architecture với TSyringe) ==========
// GET /api/admin/getSuppliers
router.get(
  "/getSuppliers",
  checkPermission("supplier:read"),
  supplierController.getAllSuppliers
);

// GET /api/admin/suppliers/:id - Lấy supplier theo ID
router.get(
  "/suppliers/:id",
  checkPermission("supplier:read"),
  supplierController.getSupplierById
);

// ========== EMPLOYEE ROUTES =========
// GET /api/admin/getEmployees
router.get(
  "/getEmployees",
  checkPermission("employee:read"),
  employeeController.getAllEmployees
);

// GET /api/admin/employees/:id - Lấy employee theo ID
router.get(
  "/employees/:id",
  checkPermission("employee:read"),
  employeeController.getEmployeeById
);

// ========== ADMIN ACCOUNT ROUTES ==========
// GET /api/admin/adminAccounts
router.get(
  "/adminAccounts",
  checkPermission("admin_role:read"),
  adminAccountController.getAllAdminAccounts
);

// GET /api/admin/adminAccounts/:id - Lấy admin account theo ID
router.get(
  "/adminAccounts/:id",
  checkPermission("admin_role:read"),
  adminAccountController.getAdminAccountById
);

// ========== CUSTOMER ROUTES (Layered Architecture với TSyringe) ==========
// GET /api/admin/getCustomers - Lấy tất cả customers với stats (total_orders, total_spent)
router.get(
  "/getCustomers",
  checkPermission("customer:read"),
  customerController.getAllCustomers
);

// GET /api/admin/customers/:id - Lấy customer theo ID với stats
router.get(
  "/customers/:id",
  checkPermission("customer:read"),
  customerController.getCustomerById
);

// ========== DASHBOARD ROUTES (Layered Architecture với TSyringe) ==========
// GET /api/admin/getRecentOrders?limit=5 - Lấy recent orders (mặc định 5 orders gần nhất)
router.get(
  "/getRecentOrders",
  checkPermission("dashboard:read:recent_orders"),
  recentOrderController.getRecentOrders
);

// GET /api/admin/getDashBoardStats - Lấy dashboard stats (totalOrders, totalCustomers, totalProducts, totalRevenue)
router.get(
  "/getDashBoardStats",
  checkPermission("dashboard:read"),
  dashboardController.getDashboardStats
);

// GET /api/admin/getTopSellingProducts?limit=5 - Lấy top selling products (mặc định top 5)
router.get(
  "/getTopSellingProducts",
  checkPermission("dashboard:read:top_products"),
  topSellingProductController.getTopSellingProducts
);

// ========== INVOICE ROUTES ==========
// GET /api/admin/getInvoices?startDate=&endDate=&status= - Lấy danh sách invoices với filters
router.get(
  "/getInvoices",
  checkPermission("invoice:read"),
  invoiceController.getInvoices
);

// GET /api/admin/getInvoice/:orderId - Lấy chi tiết invoice theo order ID
router.get(
  "/getInvoice/:orderId",
  checkPermission("invoice:read:detail"),
  invoiceController.getInvoiceByOrderId
);

// ========== STATISTICS ROUTES ==========
// GET /api/admin/statistics/revenue?period=month - Thống kê doanh thu theo thời gian (day/week/month/year)
router.get(
  "/statistics/revenue",
  checkPermission("dashboard:read"),
  statisticsController.getRevenueStatistics
);

// GET /api/admin/statistics/products - Thống kê sản phẩm (totalProducts, totalQuantity, outOfStockProducts)
router.get(
  "/statistics/products",
  checkPermission("dashboard:read"),
  statisticsController.getProductStatistics
);

// GET /api/admin/statistics/orders - Thống kê đơn hàng theo trạng thái (statusCount, statusRevenue)
router.get(
  "/statistics/orders",
  checkPermission("dashboard:read"),
  statisticsController.getOrderStatistics
);

// GET /api/admin/statistics/summary?startDate=&endDate= - Thống kê tổng hợp với date range filter
router.get(
  "/statistics/summary",
  checkPermission("dashboard:read"),
  statisticsController.getSummaryStatistics
);

// ========== PRODUCT ROUTES ==========
// GET /api/admin/getProducts - Lấy tất cả products (không bao gồm deleted products)
router.get(
  "/getProducts",
  checkPermission("product:read"),
  productController.getAllProducts
);

// GET /api/admin/products/:id - Lấy product theo ID với product items và images
router.get(
  "/products/:id",
  checkPermission("product:read"),
  productController.getProductById
);

// POST /api/admin/createProducts - Tạo product mới với product items và configurations
router.post(
  "/createProducts",
  checkPermission("product:create"),
  productController.createProduct
);

// PUT /api/admin/updateProduct/:id - Cập nhật product (chỉ update product_name, category_id, price)
router.put(
  "/updateProduct/:id",
  checkPermission("product:update"),
  productController.updateProduct
);

// DELETE /api/admin/deleteProduct/:id - Xóa product (soft delete: set is_deleted = true)
router.delete(
  "/deleteProduct/:id",
  checkPermission("product:delete"),
  productController.deleteProduct
);

// GET /api/admin/getProductsItem - Lấy tất cả product items
router.get(
  "/getProductsItem",
  checkPermission("product:read"),
  productController.getAllProductItems
);

// ========== ORDER ROUTES ==========
// GET /api/admin/getOrders - Lấy tất cả orders
router.get(
  "/getOrders",
  checkPermission("order:read"),
  recentOrderController.getAllOrders
);

// GET /api/admin/getOrdersDetail?order_id= - Lấy order details theo order ID
router.get(
  "/getOrdersDetail",
  checkPermission("order:read:detail"),
  recentOrderController.getOrderDetails
);

// PATCH /api/admin/updateOrderStatus - Cập nhật order status (có logic trả lại số lượng khi hủy đơn)
router.patch(
  "/updateOrderStatus",
  checkPermission("order:update"),
  recentOrderController.updateOrderStatus
);

// ========== IMAGE UPLOAD ROUTES ==========
// POST /api/admin/uploadImage - Upload image cho product item (multipart/form-data với field "image")
router.post(
  "/uploadImage",
  checkPermission("product:create"),
  imageController.uploadImage
);

// ========== PURCHASE ORDER ROUTES ==========
// GET /api/admin/getPurchaseOrders - Lấy tất cả purchase orders với supplier và employee info
router.get(
  "/getPurchaseOrders",
  checkPermission("purchase_order:read"),
  purchaseOrderController.getAllPurchaseOrders
);

// GET /api/admin/getPurchaseOrderDetail/:id - Lấy chi tiết purchase order với items và products
router.get(
  "/getPurchaseOrderDetail/:id",
  checkPermission("purchase_order:read:detail"),
  purchaseOrderController.getPurchaseOrderDetail
);

// POST /api/admin/createPurchaseOrder - Tạo purchase order mới (có logic tạo product nếu chưa có, cập nhật quantity)
router.post(
  "/createPurchaseOrder",
  checkPermission("purchase_order:create"),
  purchaseOrderController.createPurchaseOrder
);

export default router;
