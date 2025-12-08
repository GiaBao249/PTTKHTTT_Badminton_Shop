"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const tsyringe_1 = require("tsyringe");
const authRequired_1 = require("../middleware/authRequired");
const CustomerInfoController_1 = require("../controllers/CustomerInfoController");
const router = express_1.default.Router();
// Resolve dependency
const customerInfoController = tsyringe_1.container.resolve(CustomerInfoController_1.CustomerInfoController);
// GET /api/info/:id - Lấy customer info với addresses
router.get("/:id", authRequired_1.authRequired, customerInfoController.getCustomerInfo);
// PUT /api/info/:id - Cập nhật customer info (protected)
router.put("/:id", authRequired_1.authRequired, customerInfoController.updateCustomer);
// PUT /api/info/:id/password - Đổi password (protected)
router.put("/:id/password", authRequired_1.authRequired, customerInfoController.updatePassword);
// POST /api/info/:id/address - Tạo address mới (protected)
router.post("/:id/address", authRequired_1.authRequired, customerInfoController.createAddress);
// PUT /api/info/:id/address/:addressId - Cập nhật address (protected)
router.put("/:id/address/:addressId", authRequired_1.authRequired, customerInfoController.updateAddress);
exports.default = router;
//# sourceMappingURL=infoCustomer.js.map