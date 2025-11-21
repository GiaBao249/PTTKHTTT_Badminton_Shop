import express from "express";
import { registerCartRoutes } from "./orders/cartlist";
import { registerMyOrdersRoutes } from "./orders/myorders";
import { registerCancelOrderRoutes } from "./orders/cancelOrder";
const router = express.Router();

registerCartRoutes(router);
registerMyOrdersRoutes(router);
registerCancelOrderRoutes(router);

export default router;
