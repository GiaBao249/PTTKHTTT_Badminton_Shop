import express from "express";
import { registerProductAdmin } from "./admin/product";
const router = express.Router();

registerProductAdmin(router);

export default router;
