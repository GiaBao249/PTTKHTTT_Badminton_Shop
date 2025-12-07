import { injectable, inject } from "tsyringe";
import { PurchaseOrderRepository } from "../repositories/PurchaseOrderRepository";
import {
  PurchaseOrder,
  PurchaseOrderDetail,
  CreatePurchaseOrderDto,
} from "../models/PurchaseOrder";
import { AppError } from "../middleware/errorHandler";

@injectable()
export class PurchaseOrderService {
  constructor(
    @inject(PurchaseOrderRepository)
    private purchaseOrderRepo: PurchaseOrderRepository
  ) {}

  /**
   * Lấy tất cả purchase orders với supplier và employee info
   */
  async getAllPurchaseOrders(): Promise<PurchaseOrder[]> {
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
  async getPurchaseOrderById(purchaseOrderId: number): Promise<PurchaseOrder> {
    const purchaseOrder = await this.purchaseOrderRepo.findById(
      purchaseOrderId
    );

    if (!purchaseOrder) {
      throw new AppError(
        404,
        "Purchase order not found",
        "PURCHASE_ORDER_NOT_FOUND"
      );
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

    const orderDetails =
      await this.purchaseOrderRepo.getPurchaseOrderDetailsByPurchaseOrderId(
        purchaseOrderId
      );

    let itemsWithProducts: PurchaseOrderDetail[] = [];

    if (orderDetails.length > 0) {
      const productIds = orderDetails
        .map((od) => od.product_id)
        .filter(Boolean);

      if (productIds.length > 0) {
        const productMap = await this.purchaseOrderRepo.getProductsWithImages(
          productIds
        );

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
  async createPurchaseOrder(
    createDto: CreatePurchaseOrderDto
  ): Promise<PurchaseOrder> {
    // Validation
    if (!createDto.supplier_id || !createDto.employee_id) {
      throw new AppError(400, "Thiếu thông tin phiếu nhập", "VALIDATION_ERROR");
    }

    if (
      !createDto.items ||
      !Array.isArray(createDto.items) ||
      createDto.items.length === 0
    ) {
      throw new AppError(400, "Thiếu thông tin phiếu nhập", "VALIDATION_ERROR");
    }

    // Lấy next purchase order ID
    const maxId = await this.purchaseOrderRepo.getMaxPurchaseOrderId();
    const nextPurchaseOrderId = maxId + 1;

    const purchaseOrder = await this.purchaseOrderRepo.create(
      nextPurchaseOrderId,
      createDto.supplier_id,
      createDto.employee_id
    );

    // Xử lý từng item
    const purchaseOrderDetails: Array<{
      purchaseorderdetail_id: number;
      purchaseorder_id: number;
      product_id: number;
      price: number;
      quantity: number;
    }> = [];

    for (const item of createDto.items) {
      // Validation item
      if (!item.quantity || item.quantity <= 0) {
        throw new AppError(
          400,
          `Số lượng phải lớn hơn 0 cho sản phẩm`,
          "VALIDATION_ERROR"
        );
      }

      let finalProductId: number;

      // Kiểm tra nếu có product_id (sử dụng sản phẩm có sẵn)
      if (
        item.product_id !== null &&
        item.product_id !== undefined &&
        typeof item.product_id === "number"
      ) {
        const existingProduct = await this.purchaseOrderRepo.findProductById(
          Number(item.product_id)
        );

        if (!existingProduct) {
          throw new AppError(
            400,
            `Không tìm thấy sản phẩm với ID: ${item.product_id}`,
            "PRODUCT_NOT_FOUND"
          );
        }

        // Cập nhật product nếu cần
        const updateData: { price_purchase?: number; supplier_id?: number } =
          {};
        if (item.price && item.price > 0) {
          updateData.price_purchase = item.price;
        }
        if (createDto.supplier_id) {
          updateData.supplier_id = createDto.supplier_id;
        }

        if (Object.keys(updateData).length > 0) {
          await this.purchaseOrderRepo.updateProduct(
            Number(item.product_id),
            updateData
          );
        }

        finalProductId = Number(item.product_id);
      } else {
        // Tạo sản phẩm mới
        if (
          !item.product_name ||
          !item.product_name.trim() ||
          !item.category_id
        ) {
          throw new AppError(
            400,
            "Thiếu thông tin sản phẩm (tên và danh mục là bắt buộc)",
            "VALIDATION_ERROR"
          );
        }

        const productData: {
          product_name: string;
          category_id: number;
          description: string;
          warranty_period: number;
          price: number;
          price_purchase: number;
          supplier_id?: number;
        } = {
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

        const newProduct = await this.purchaseOrderRepo.createProduct(
          productData
        );

        finalProductId = newProduct.product_id;
      }

      // Cập nhật hoặc tạo product item
      const existingItem =
        await this.purchaseOrderRepo.getProductItemByProductId(finalProductId);

      if (existingItem) {
        const newQuantity = (existingItem.quantity || 0) + item.quantity;
        await this.purchaseOrderRepo.updateProductItemQuantity(
          existingItem.product_item_id,
          newQuantity
        );
      } else {
        await this.purchaseOrderRepo.createProductItem(
          finalProductId,
          item.quantity
        );
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
      const maxDetailId =
        await this.purchaseOrderRepo.getMaxPurchaseOrderDetailId();

      const detailsWithId = purchaseOrderDetails.map((detail, index) => ({
        ...detail,
        purchaseorderdetail_id: maxDetailId + 1 + index,
      }));

      await this.purchaseOrderRepo.createPurchaseOrderDetails(detailsWithId);
    }

    return purchaseOrder;
  }
}
