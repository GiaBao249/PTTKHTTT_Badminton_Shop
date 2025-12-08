"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchaseOrderService = void 0;
const tsyringe_1 = require("tsyringe");
const PurchaseOrderRepository_1 = require("../repositories/PurchaseOrderRepository");
const errorHandler_1 = require("../middleware/errorHandler");
let PurchaseOrderService = class PurchaseOrderService {
    constructor(purchaseOrderRepo) {
        this.purchaseOrderRepo = purchaseOrderRepo;
    }
    /**
     * Lấy tất cả purchase orders với supplier và employee info
     */
    async getAllPurchaseOrders() {
        const purchaseOrders = await this.purchaseOrderRepo.findAll();
        if (purchaseOrders.length === 0) {
            return [];
        }
        // Lấy supplier IDs và employee IDs
        const supplierIds = [
            ...new Set(purchaseOrders.map((po) => po.supplier_id).filter(Boolean)),
        ];
        const employeeIds = [
            ...new Set(purchaseOrders.map((po) => po.employee_id).filter(Boolean)),
        ];
        const [supplierMap, employeeMap] = await Promise.all([
            this.purchaseOrderRepo.getSuppliersByIds(supplierIds),
            this.purchaseOrderRepo.getEmployeesByIds(employeeIds),
        ]);
        return purchaseOrders.map((po) => ({
            ...po,
            supplier: supplierMap.get(po.supplier_id) || null,
            employee: employeeMap.get(po.employee_id) || null,
        }));
    }
    /**
     * Lấy purchase order theo ID với details
     */
    async getPurchaseOrderById(purchaseOrderId) {
        const purchaseOrder = await this.purchaseOrderRepo.findById(purchaseOrderId);
        if (!purchaseOrder) {
            throw new errorHandler_1.AppError(404, "Purchase order not found", "PURCHASE_ORDER_NOT_FOUND");
        }
        const [supplierMap, employeeMap] = await Promise.all([
            purchaseOrder.supplier_id
                ? this.purchaseOrderRepo.getSuppliersByIds([purchaseOrder.supplier_id])
                : Promise.resolve(new Map()),
            purchaseOrder.employee_id
                ? this.purchaseOrderRepo.getEmployeesByIds([purchaseOrder.employee_id])
                : Promise.resolve(new Map()),
        ]);
        const supplier = purchaseOrder.supplier_id
            ? supplierMap.get(purchaseOrder.supplier_id) || null
            : null;
        const employee = purchaseOrder.employee_id
            ? employeeMap.get(purchaseOrder.employee_id) || null
            : null;
        const orderDetails = await this.purchaseOrderRepo.getPurchaseOrderDetailsByPurchaseOrderId(purchaseOrderId);
        let itemsWithProducts = [];
        if (orderDetails.length > 0) {
            const productIds = orderDetails
                .map((od) => od.product_id)
                .filter(Boolean);
            if (productIds.length > 0) {
                const productMap = await this.purchaseOrderRepo.getProductsWithImages(productIds);
                itemsWithProducts = orderDetails.map((od) => {
                    const product = productMap.get(od.product_id);
                    return {
                        ...od,
                        product: product
                            ? {
                                ...product,
                                thumbnail: product.thumbnail ?? null,
                            }
                            : null,
                    };
                });
            }
        }
        return {
            ...purchaseOrder,
            supplier,
            employee,
            items: itemsWithProducts,
        };
    }
    /**
     * Tạo purchase order mới với logic phức tạp
     */
    async createPurchaseOrder(createDto) {
        // Validation
        if (!createDto.supplier_id || !createDto.employee_id) {
            throw new errorHandler_1.AppError(400, "Thiếu thông tin phiếu nhập", "VALIDATION_ERROR");
        }
        if (!createDto.items ||
            !Array.isArray(createDto.items) ||
            createDto.items.length === 0) {
            throw new errorHandler_1.AppError(400, "Thiếu thông tin phiếu nhập", "VALIDATION_ERROR");
        }
        // Lấy next purchase order ID
        const maxId = await this.purchaseOrderRepo.getMaxPurchaseOrderId();
        const nextPurchaseOrderId = maxId + 1;
        const purchaseOrder = await this.purchaseOrderRepo.create(nextPurchaseOrderId, createDto.supplier_id, createDto.employee_id);
        // Xử lý từng item
        const purchaseOrderDetails = [];
        for (const item of createDto.items) {
            // Validation item
            if (!item.quantity || item.quantity <= 0) {
                throw new errorHandler_1.AppError(400, `Số lượng phải lớn hơn 0 cho sản phẩm`, "VALIDATION_ERROR");
            }
            let finalProductId;
            // Kiểm tra nếu có product_id (sử dụng sản phẩm có sẵn)
            if (item.product_id !== null &&
                item.product_id !== undefined &&
                typeof item.product_id === "number") {
                const existingProduct = await this.purchaseOrderRepo.findProductById(Number(item.product_id));
                if (!existingProduct) {
                    throw new errorHandler_1.AppError(400, `Không tìm thấy sản phẩm với ID: ${item.product_id}`, "PRODUCT_NOT_FOUND");
                }
                // Cập nhật product nếu cần
                const updateData = {};
                if (item.price && item.price > 0) {
                    updateData.price_purchase = item.price;
                }
                if (createDto.supplier_id) {
                    updateData.supplier_id = createDto.supplier_id;
                }
                if (Object.keys(updateData).length > 0) {
                    await this.purchaseOrderRepo.updateProduct(Number(item.product_id), updateData);
                }
                finalProductId = Number(item.product_id);
            }
            else {
                // Tạo sản phẩm mới
                if (!item.product_name ||
                    !item.product_name.trim() ||
                    !item.category_id) {
                    throw new errorHandler_1.AppError(400, "Thiếu thông tin sản phẩm (tên và danh mục là bắt buộc)", "VALIDATION_ERROR");
                }
                const productData = {
                    product_name: item.product_name.trim(),
                    category_id: item.category_id,
                    description: item.description || "",
                    warranty_period: item.warranty_period || 0,
                    price: 0,
                    price_purchase: item.price || 0,
                };
                if (createDto.supplier_id) {
                    productData.supplier_id = createDto.supplier_id;
                }
                const newProduct = await this.purchaseOrderRepo.createProduct(productData);
                finalProductId = newProduct.product_id;
            }
            // Cập nhật hoặc tạo product item
            const existingItem = await this.purchaseOrderRepo.getProductItemByProductId(finalProductId);
            if (existingItem) {
                const newQuantity = (existingItem.quantity || 0) + item.quantity;
                await this.purchaseOrderRepo.updateProductItemQuantity(existingItem.product_item_id, newQuantity);
            }
            else {
                await this.purchaseOrderRepo.createProductItem(finalProductId, item.quantity);
            }
            purchaseOrderDetails.push({
                purchaseorderdetail_id: 0, // Sẽ được set sau
                purchaseorder_id: purchaseOrder.purchaseorder_id,
                product_id: finalProductId,
                price: item.price,
                quantity: item.quantity,
            });
        }
        // Tạo purchase order details
        if (purchaseOrderDetails.length > 0) {
            const maxDetailId = await this.purchaseOrderRepo.getMaxPurchaseOrderDetailId();
            const detailsWithId = purchaseOrderDetails.map((detail, index) => ({
                ...detail,
                purchaseorderdetail_id: maxDetailId + 1 + index,
            }));
            await this.purchaseOrderRepo.createPurchaseOrderDetails(detailsWithId);
        }
        return purchaseOrder;
    }
};
exports.PurchaseOrderService = PurchaseOrderService;
exports.PurchaseOrderService = PurchaseOrderService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(PurchaseOrderRepository_1.PurchaseOrderRepository)),
    __metadata("design:paramtypes", [PurchaseOrderRepository_1.PurchaseOrderRepository])
], PurchaseOrderService);
//# sourceMappingURL=PurchaseOrderService.js.map