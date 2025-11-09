import express from "express";
import { registerCheckoutRoutes } from "./checkout/checkout";
import { authRequired } from "../middleware/authRequired";
const router = express.Router();
router.use(authRequired);
registerCheckoutRoutes(router);
export default router;
