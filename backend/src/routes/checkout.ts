import express from "express";
import { container } from "tsyringe";
import { authRequired } from "../middleware/authRequired";
import { CheckoutController } from "../controllers/CheckoutController";

const router = express.Router();

// Resolve dependency
const checkoutController = container.resolve(CheckoutController);

// POST /api/checkout/checkout - Xử lý checkout
router.post("/checkout", authRequired, checkoutController.checkout);

export default router;
