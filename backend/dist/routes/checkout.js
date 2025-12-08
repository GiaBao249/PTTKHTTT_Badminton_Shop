"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const tsyringe_1 = require("tsyringe");
const authRequired_1 = require("../middleware/authRequired");
const CheckoutController_1 = require("../controllers/CheckoutController");
const router = express_1.default.Router();
// Resolve dependency
const checkoutController = tsyringe_1.container.resolve(CheckoutController_1.CheckoutController);
// POST /api/checkout/checkout - Xử lý checkout
router.post("/checkout", authRequired_1.authRequired, checkoutController.checkout);
exports.default = router;
//# sourceMappingURL=checkout.js.map