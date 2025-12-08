import { PurchaseOrder, PurchaseOrderDetail } from "../models/PurchaseOrder";
export declare class PurchaseOrderRepository {
    /**
     * Lấy tất cả purchase orders - OPTIMIZED
     */
    findAll(): Promise<PurchaseOrder[]>;
    /**
     * Lấy purchase order theo ID
     */
    findById(purchaseOrderId: number): Promise<PurchaseOrder | null>;
    /**
     * Lấy suppliers theo IDs - OPTIMIZED (batch query)
     */
    getSuppliersByIds(supplierIds: number[]): Promise<Map<number, any>>;
    /**
     * Lấy employees theo IDs - OPTIMIZED (batch query)
     */
    getEmployeesByIds(employeeIds: number[]): Promise<Map<number, any>>;
    /**
     * Lấy purchase order details theo purchase order ID
     */
    getPurchaseOrderDetailsByPurchaseOrderId(purchaseOrderId: number): Promise<PurchaseOrderDetail[]>;
    /**
     * Lấy products với images - OPTIMIZED (single query với join)
     */
    getProductsWithImages(productIds: number[]): Promise<Map<number, any>>;
    /**
     * Lấy max purchase order ID
     */
    getMaxPurchaseOrderId(): Promise<number>;
    /**
     * Tạo purchase order
     */
    create(purchaseOrderId: number, supplierId: number, employeeId: number): Promise<PurchaseOrder>;
    /**
     * Lấy max purchase order detail ID
     */
    getMaxPurchaseOrderDetailId(): Promise<number>;
    /**
     * Tạo purchase order details
     */
    createPurchaseOrderDetails(details: Array<{
        purchaseorderdetail_id: number;
        purchaseorder_id: number;
        product_id: number;
        price: number;
        quantity: number;
    }>): Promise<void>;
    /**
     * Kiểm tra product có tồn tại
     */
    findProductById(productId: number): Promise<any | null>;
    /**
     * Tạo product mới
     */
    createProduct(productData: {
        product_name: string;
        category_id: number;
        supplier_id?: number;
        price: number;
        price_purchase: number;
        description?: string;
        warranty_period?: number;
    }): Promise<any>;
    /**
     * Cập nhật product
     */
    updateProduct(productId: number, updateData: {
        price_purchase?: number;
        supplier_id?: number;
    }): Promise<void>;
    /**
     * Lấy product item theo product ID
     */
    getProductItemByProductId(productId: number): Promise<any | null>;
    /**
     * Cập nhật product item quantity
     */
    updateProductItemQuantity(productItemId: number, newQuantity: number): Promise<void>;
    /**
     * Tạo product item mới
     */
    createProductItem(productId: number, quantity: number): Promise<void>;
}
//# sourceMappingURL=PurchaseOrderRepository.d.ts.map