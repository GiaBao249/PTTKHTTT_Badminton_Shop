export interface Invoice {
    order_id: number;
    customer_id: number;
    status: string;
    total_amount: number;
    order_date: string;
    delivery_date?: string;
    address_id?: number;
    customer?: {
        customer_id: number;
        customer_name: string;
        customer_phone?: string;
        customer_email?: string;
    };
    orderdetail?: InvoiceOrderDetail[];
}
export interface InvoiceOrderDetail {
    order_id: number;
    product_item_id: number;
    quantity: number;
    amount: number;
    product_item?: {
        product_item_id: number;
        product_id: number;
        product?: {
            product_id: number;
            product_name: string;
            price: number;
            category_id?: number;
            category?: {
                category_id: number;
                category_name: string;
            };
            thumbnail?: string | null;
        };
    };
}
export interface GetInvoicesQuery {
    startDate?: string;
    endDate?: string;
    status?: string;
}
//# sourceMappingURL=Invoice.d.ts.map