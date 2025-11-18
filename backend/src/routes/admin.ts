import express from "express";
import { registerDashBoardAdmin } from "./admin/dashboard";
import { registerRecentOrders } from "./admin/recentOrders";
import { registerGetCustomers } from "./admin/customer"; 
import { registerCreateProduct } from "./admin/createProduct";
import  { registerGetProduct } from "./admin/getProduct";
import { registerGetProductItem } from "./admin/getProductItem";
import { register } from "module";
const router = express.Router();
registerDashBoardAdmin(router);
registerRecentOrders(router);
registerGetCustomers(router);
// registerCreateProduct(router);
registerGetProduct(router);
registerGetProductItem(router);

export default router;
