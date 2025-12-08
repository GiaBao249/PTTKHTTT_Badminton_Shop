export interface PurchaseOrder {
    purchaseorder_id: number;
    supplier_id: number;
    employee_id: number;
    purchaseorder_date: string;
    supplier?: {
        supplier_id: number;
        supplier_name: string;
    };
    employee?: {
        employee_id: number;
        name: string;
    };
    items?: PurchaseOrderDetail[];
}
export interface PurchaseOrderDetail {
    purchaseorderdetail_id: number;
    purchaseorder_id: number;
    product_id: number;
    price: number;
    quantity: number;
    product?: {
        product_id: number;
        product_name: string;
        category_id: number;
        description?: string;
        warranty_period?: number;
        thumbnail?: string | null;
    };
}
export interface CreatePurchaseOrderDto {
    supplier_id: number;
    employee_id: number;
    items: Array<{
        product_id?: number | null;
        product_name?: string;
        category_id?: number;
        price: number;
        quantity: number;
        description?: string;
        warranty_period?: number;
    }>;
}
//# sourceMappingURL=PurchaseOrder.d.ts.map