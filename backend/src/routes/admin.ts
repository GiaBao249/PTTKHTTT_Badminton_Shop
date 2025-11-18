import express from "express";
import { registerDashBoardAdmin } from "./admin/dashboard";
const router = express.Router();
registerDashBoardAdmin(router);

export default router;
