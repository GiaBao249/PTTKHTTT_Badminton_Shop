import express from "express";
import { registerInfoCustomerRoutes } from "./info/customers";
import { authRequired } from "../middleware/authRequired";
const router = express.Router();
router.use(authRequired);
registerInfoCustomerRoutes(router);
export default router;
