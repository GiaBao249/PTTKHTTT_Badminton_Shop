"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const tsyringe_1 = require("tsyringe");
const authRequired_1 = require("../middleware/authRequired");
const requireAdminRole_1 = require("../middleware/requireAdminRole");
const checkPermission_1 = require("../middleware/checkPermission");
const CategoryController_1 = require("../controllers/CategoryController");
const SupplierController_1 = require("../controllers/SupplierController");
const EmployeeController_1 = require("../controllers/EmployeeController");
const AdminAccountController_1 = require("../controllers/AdminAccountController");
const CustomerController_1 = require("../controllers/CustomerController");
const RecentOrderController_1 = require("../controllers/RecentOrderController");
const DashboardController_1 = require("../controllers/DashboardController");
const TopSellingProductController_1 = require("../controllers/TopSellingProductController");
const InvoiceController_1 = require("../controllers/InvoiceController");
const StatisticsController_1 = require("../controllers/StatisticsController");
const ProductController_1 = require("../controllers/ProductController");
const PurchaseOrderController_1 = require("../controllers/PurchaseOrderController");
const PermissionController_1 = require("../controllers/PermissionController");
const ImageController_1 = require("../controllers/ImageController");
const router = express_1.default.Router();
// ========== RESOLVE DEPENDENCIES TỪ CONTAINER ==========
const categoryController = tsyringe_1.container.resolve(CategoryController_1.CategoryController);
const supplierController = tsyringe_1.container.resolve(SupplierController_1.SupplierController);
const employeeController = tsyringe_1.container.resolve(EmployeeController_1.EmployeeController);
const adminAccountController = tsyringe_1.container.resolve(AdminAccountController_1.AdminAccountController);
const customerController = tsyringe_1.container.resolve(CustomerController_1.CustomerController);
const recentOrderController = tsyringe_1.container.resolve(RecentOrderController_1.OrderController);
const dashboardController = tsyringe_1.container.resolve(DashboardController_1.DashboardController);
const invoiceController = tsyringe_1.container.resolve(InvoiceController_1.InvoiceController);
const statisticsController = tsyringe_1.container.resolve(StatisticsController_1.StatisticsController);
const topSellingProductController = tsyringe_1.container.resolve(TopSellingProductController_1.TopSellingProductController);
const productController = tsyringe_1.container.resolve(ProductController_1.ProductController);
const purchaseOrderController = tsyringe_1.container.resolve(PurchaseOrderController_1.PurchaseOrderController);
const permissionController = tsyringe_1.container.resolve(PermissionController_1.PermissionController);
const imageController = tsyringe_1.container.resolve(ImageController_1.ImageController);
// ========== MIDDLEWARE: AUTHENTICATION ==========
// Áp dụng authRequired cho TẤT CẢ routes admin (yêu cầu JWT token)
router.use(authRequired_1.authRequired);
// ========== ROUTE ĐẶC BIỆT: GET PERMISSIONS ==========
// Route này KHÔNG cần requireAdminRole vì admin cần xem permissions của mình
// ngay cả khi chưa được gán roles (để biết mình có quyền gì)
// GET /api/admin/getPermissions - Lấy permissions của admin hiện tại
router.get("/getPermissions", permissionController.getPermissions);
// ========== MIDDLEWARE: AUTHORIZATION ==========
// Áp dụng requireAdminRole cho TẤT CẢ routes còn lại
// Admin phải có ít nhất một role mới được truy cập các routes dưới đây
router.use(requireAdminRole_1.requireAdminRole);
// ========== PERMISSION & ROLE ROUTES ==========
// Quản lý Roles
// GET /api/admin/roles - Lấy tất cả roles với permissions
router.get("/roles", (0, checkPermission_1.checkPermission)("role:read"), permissionController.getAllRoles);
// POST /api/admin/roles - Tạo role mới
router.post("/roles", (0, checkPermission_1.checkPermission)("role:create"), permissionController.createRole);
// PUT /api/admin/roles/:id - Cập nhật role
router.put("/roles/:id", (0, checkPermission_1.checkPermission)("role:update"), permissionController.updateRole);
// DELETE /api/admin/roles/:id - Xóa role (cascade delete: xóa role_permissions và admin_roles)
router.delete("/roles/:id", (0, checkPermission_1.checkPermission)("role:delete"), permissionController.deleteRole);
// Quản lý Permissions
// GET /api/admin/permissions - Lấy tất cả permissions
router.get("/permissions", (0, checkPermission_1.checkPermission)("permission:read"), permissionController.getAllPermissions);
// POST /api/admin/permissions - Tạo permission mới
router.post("/permissions", (0, checkPermission_1.checkPermission)("permission:manage"), permissionController.createPermission);
// PUT /api/admin/permissions/:id - Cập nhật permission
router.put("/permissions/:id", (0, checkPermission_1.checkPermission)("permission:manage"), permissionController.updatePermission);
// DELETE /api/admin/permissions/:id - Xóa permission (cascade delete: xóa role_permissions)
router.delete("/permissions/:id", (0, checkPermission_1.checkPermission)("permission:manage"), permissionController.deletePermission);
// Quản lý Admin Roles (Gán roles cho admin)
// GET /api/admin/admin/:adminId/roles - Lấy roles của một admin
router.get("/admin/:adminId/roles", (0, checkPermission_1.checkPermission)("admin_role:read"), permissionController.getAdminRoles);
// POST /api/admin/admin/:adminId/roles - Gán roles cho admin (replace tất cả roles cũ)
router.post("/admin/:adminId/roles", (0, checkPermission_1.checkPermission)("admin_role:update"), permissionController.assignRolesToAdmin);
// ========== CATEGORY ROUTES (Layered Architecture với TSyringe) ==========
// GET /api/admin/getCategories - Lấy tất cả categories
router.get("/getCategories", (0, checkPermission_1.checkPermission)("category:read"), categoryController.getAllCategories);
// GET /api/admin/categories/:id - Lấy category theo ID
router.get("/categories/:id", (0, checkPermission_1.checkPermission)("category:read"), categoryController.getCategoryById);
// POST /api/admin/categories - Tạo category mới
router.post("/categories", (0, checkPermission_1.checkPermission)("category:create"), categoryController.createCategory);
// PUT /api/admin/categories/:id - Cập nhật category
router.put("/categories/:id", (0, checkPermission_1.checkPermission)("category:update"), categoryController.updateCategory);
// DELETE /api/admin/categories/:id - Xóa category
router.delete("/categories/:id", (0, checkPermission_1.checkPermission)("category:delete"), categoryController.deleteCategory);
// ========== SUPPLIER ROUTES (Layered Architecture với TSyringe) ==========
// GET /api/admin/getSuppliers
router.get("/getSuppliers", (0, checkPermission_1.checkPermission)("supplier:read"), supplierController.getAllSuppliers);
// GET /api/admin/suppliers/:id - Lấy supplier theo ID
router.get("/suppliers/:id", (0, checkPermission_1.checkPermission)("supplier:read"), supplierController.getSupplierById);
// ========== EMPLOYEE ROUTES =========
// GET /api/admin/getEmployees
router.get("/getEmployees", (0, checkPermission_1.checkPermission)("employee:read"), employeeController.getAllEmployees);
// GET /api/admin/employees/:id - Lấy employee theo ID
router.get("/employees/:id", (0, checkPermission_1.checkPermission)("employee:read"), employeeController.getEmployeeById);
// ========== ADMIN ACCOUNT ROUTES ==========
// GET /api/admin/adminAccounts
router.get("/adminAccounts", (0, checkPermission_1.checkPermission)("admin_role:read"), adminAccountController.getAllAdminAccounts);
// GET /api/admin/adminAccounts/:id - Lấy admin account theo ID
router.get("/adminAccounts/:id", (0, checkPermission_1.checkPermission)("admin_role:read"), adminAccountController.getAdminAccountById);
// ========== CUSTOMER ROUTES (Layered Architecture với TSyringe) ==========
// GET /api/admin/getCustomers - Lấy tất cả customers với stats (total_orders, total_spent)
router.get("/getCustomers", (0, checkPermission_1.checkPermission)("customer:read"), customerController.getAllCustomers);
// GET /api/admin/customers/:id - Lấy customer theo ID với stats
router.get("/customers/:id", (0, checkPermission_1.checkPermission)("customer:read"), customerController.getCustomerById);
// ========== DASHBOARD ROUTES (Layered Architecture với TSyringe) ==========
// GET /api/admin/getRecentOrders?limit=5 - Lấy recent orders (mặc định 5 orders gần nhất)
router.get("/getRecentOrders", (0, checkPermission_1.checkPermission)("dashboard:read:recent_orders"), recentOrderController.getRecentOrders);
// GET /api/admin/getDashBoardStats - Lấy dashboard stats (totalOrders, totalCustomers, totalProducts, totalRevenue)
router.get("/getDashBoardStats", (0, checkPermission_1.checkPermission)("dashboard:read"), dashboardController.getDashboardStats);
// GET /api/admin/getTopSellingProducts?limit=5 - Lấy top selling products (mặc định top 5)
router.get("/getTopSellingProducts", (0, checkPermission_1.checkPermission)("dashboard:read:top_products"), topSellingProductController.getTopSellingProducts);
// ========== INVOICE ROUTES ==========
// GET /api/admin/getInvoices?startDate=&endDate=&status= - Lấy danh sách invoices với filters
router.get("/getInvoices", (0, checkPermission_1.checkPermission)("invoice:read"), invoiceController.getInvoices);
// GET /api/admin/getInvoice/:orderId - Lấy chi tiết invoice theo order ID
router.get("/getInvoice/:orderId", (0, checkPermission_1.checkPermission)("invoice:read:detail"), invoiceController.getInvoiceByOrderId);
// ========== STATISTICS ROUTES ==========
// GET /api/admin/statistics/revenue?period=month - Thống kê doanh thu theo thời gian (day/week/month/year)
router.get("/statistics/revenue", (0, checkPermission_1.checkPermission)("dashboard:read"), statisticsController.getRevenueStatistics);
// GET /api/admin/statistics/products - Thống kê sản phẩm (totalProducts, totalQuantity, outOfStockProducts)
router.get("/statistics/products", (0, checkPermission_1.checkPermission)("dashboard:read"), statisticsController.getProductStatistics);
// GET /api/admin/statistics/orders - Thống kê đơn hàng theo trạng thái (statusCount, statusRevenue)
router.get("/statistics/orders", (0, checkPermission_1.checkPermission)("dashboard:read"), statisticsController.getOrderStatistics);
// GET /api/admin/statistics/summary?startDate=&endDate= - Thống kê tổng hợp với date range filter
router.get("/statistics/summary", (0, checkPermission_1.checkPermission)("dashboard:read"), statisticsController.getSummaryStatistics);
// ========== PRODUCT ROUTES ==========
// GET /api/admin/getProducts - Lấy tất cả products (không bao gồm deleted products)
router.get("/getProducts", (0, checkPermission_1.checkPermission)("product:read"), productController.getAllProducts);
// GET /api/admin/products/:id - Lấy product theo ID với product items và images
router.get("/products/:id", (0, checkPermission_1.checkPermission)("product:read"), productController.getProductById);
// POST /api/admin/createProducts - Tạo product mới với product items và configurations
router.post("/createProducts", (0, checkPermission_1.checkPermission)("product:create"), productController.createProduct);
// PUT /api/admin/updateProduct/:id - Cập nhật product (chỉ update product_name, category_id, price)
router.put("/updateProduct/:id", (0, checkPermission_1.checkPermission)("product:update"), productController.updateProduct);
// DELETE /api/admin/deleteProduct/:id - Xóa product (soft delete: set is_deleted = true)
router.delete("/deleteProduct/:id", (0, checkPermission_1.checkPermission)("product:delete"), productController.deleteProduct);
// GET /api/admin/getProductsItem - Lấy tất cả product items
router.get("/getProductsItem", (0, checkPermission_1.checkPermission)("product:read"), productController.getAllProductItems);
// ========== ORDER ROUTES ==========
// GET /api/admin/getOrders - Lấy tất cả orders
router.get("/getOrders", (0, checkPermission_1.checkPermission)("order:read"), recentOrderController.getAllOrders);
// GET /api/admin/getOrdersDetail?order_id= - Lấy order details theo order ID
router.get("/getOrdersDetail", (0, checkPermission_1.checkPermission)("order:read:detail"), recentOrderController.getOrderDetails);
// PATCH /api/admin/updateOrderStatus - Cập nhật order status (có logic trả lại số lượng khi hủy đơn)
router.patch("/updateOrderStatus", (0, checkPermission_1.checkPermission)("order:update"), recentOrderController.updateOrderStatus);
// ========== IMAGE UPLOAD ROUTES ==========
// POST /api/admin/uploadImage - Upload image cho product item (multipart/form-data với field "image")
router.post("/uploadImage", (0, checkPermission_1.checkPermission)("product:create"), imageController.uploadImage);
// ========== PURCHASE ORDER ROUTES ==========
// GET /api/admin/getPurchaseOrders - Lấy tất cả purchase orders với supplier và employee info
router.get("/getPurchaseOrders", (0, checkPermission_1.checkPermission)("purchase_order:read"), purchaseOrderController.getAllPurchaseOrders);
// GET /api/admin/getPurchaseOrderDetail/:id - Lấy chi tiết purchase order với items và products
router.get("/getPurchaseOrderDetail/:id", (0, checkPermission_1.checkPermission)("purchase_order:read:detail"), purchaseOrderController.getPurchaseOrderDetail);
// POST /api/admin/createPurchaseOrder - Tạo purchase order mới (có logic tạo product nếu chưa có, cập nhật quantity)
router.post("/createPurchaseOrder", (0, checkPermission_1.checkPermission)("purchase_order:create"), purchaseOrderController.createPurchaseOrder);
exports.default = router;
//# sourceMappingURL=admin.js.map