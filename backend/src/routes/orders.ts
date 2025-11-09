import express from "express";
import { registerCartRoutes } from "./orders/cartlist";
import { registerMyOrdersRoutes } from "./orders/myorders";
const router = express.Router();

registerCartRoutes(router);
registerMyOrdersRoutes(router);

export default router;
