import express from "express";
import { container } from "tsyringe";
import { authRequired } from "../middleware/authRequired";
import { CustomerInfoController } from "../controllers/CustomerInfoController";

const router = express.Router();

// Resolve dependency
const customerInfoController = container.resolve(CustomerInfoController);

// GET /api/info/:id - Lấy customer info với addresses
router.get("/:id", authRequired, customerInfoController.getCustomerInfo);

// PUT /api/info/:id - Cập nhật customer info (protected)
router.put("/:id", authRequired, customerInfoController.updateCustomer);

// PUT /api/info/:id/password - Đổi password (protected)
router.put("/:id/password", authRequired, customerInfoController.updatePassword);

// POST /api/info/:id/address - Tạo address mới (protected)
router.post("/:id/address", authRequired, customerInfoController.createAddress);

// PUT /api/info/:id/address/:addressId - Cập nhật address (protected)
router.put(
  "/:id/address/:addressId",
  authRequired,
  customerInfoController.updateAddress
);

export default router;
