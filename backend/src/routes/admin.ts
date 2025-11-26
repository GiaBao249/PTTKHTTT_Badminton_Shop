import express from "express";
import { authRequired } from "../middleware/authRequired";
import { requireAdminRole } from "../middleware/requireAdminRole";
import { registerDashBoardAdmin } from "./admin/getDashBoardStats";
import { registerRecentOrders } from "./admin/getRecentOrders";
import { registerGetCustomers } from "./admin/getCustomer";
import { registerCreateProduct } from "./admin/createProduct";
import { registerGetProduct } from "./admin/getProduct";
import { registerGetProductItem } from "./admin/getProductItem";
import { registerOrderRoutes } from "./admin/getOrders";
import { registerGetOrdersDetail } from "./admin/getOrdersDetail";
import { registerUpdateOrderStatus } from "./admin/updateOrderStatus";
import { registerGetPurchaseOrders } from "./admin/getPurchaseOrders";
import { registerGetPurchaseOrderDetail } from "./admin/getPurchaseOrderDetail";
import { registerCreatePurchaseOrder } from "./admin/createPurchaseOrder";
import { registerGetSuppliers } from "./admin/getSuppliers";
import { registerGetEmployees } from "./admin/getEmployees";
import { registerGetCategories } from "./admin/getCategories";
import { registerGetTopSellingProducts } from "./admin/getTopSellingProducts";
import { registerUpdateProduct } from "./admin/updateProduct";
import { registerDeleteProduct } from "./admin/deleteProduct";
import { registerGetInvoices } from "./admin/getInvoices";
import { registerGetPermissions } from "./admin/getPermissions";
import { registerManageRoles } from "./admin/manageRoles";
import { registerManagePermissions } from "./admin/managePermissions";
import { registerManageAdminRoles } from "./admin/manageAdminRoles";
import { registerGetAdminAccounts } from "./admin/getAdminAccounts";
import { registerUploadImage } from "./admin/uploadImage";
const router = express.Router();

// Áp dụng authRequired cho tất cả routes admin
router.use(authRequired);

// Route đặc biệt: getPermissions - cho phép admin xem permissions của mình ngay cả khi chưa có roles
registerGetPermissions(router);

// Áp dụng requireAdminRole cho tất cả routes còn lại (admin phải có ít nhất một role)
router.use(requireAdminRole);

registerDashBoardAdmin(router);
registerRecentOrders(router);
registerGetCustomers(router);
registerCreateProduct(router);
registerGetProduct(router);
registerGetProductItem(router);
registerOrderRoutes(router);
registerGetOrdersDetail(router);
registerUpdateOrderStatus(router);
registerGetPurchaseOrders(router);
registerGetPurchaseOrderDetail(router);
registerCreatePurchaseOrder(router);
registerGetSuppliers(router);
registerGetEmployees(router);
registerGetCategories(router);
registerGetTopSellingProducts(router);
registerUpdateProduct(router);
registerDeleteProduct(router);
registerGetInvoices(router);
// registerGetPermissions đã được đặt ở trên (trước requireAdminRole)
registerManageRoles(router);
registerManagePermissions(router);
registerManageAdminRoles(router);
registerGetAdminAccounts(router);
registerUploadImage(router);

export default router;
