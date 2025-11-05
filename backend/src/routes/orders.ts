import express from "express";
import { registerCartRoutes } from "./orders/cartlist";
const router = express.Router();

registerCartRoutes(router);

export default router;
