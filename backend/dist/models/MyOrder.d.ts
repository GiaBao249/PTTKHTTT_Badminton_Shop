export interface MyOrder {
    order_id: number;
    customer_id: number;
    status: string;
    total_amount: number;
    order_date: string;
    delivery_date?: string;
    address_id?: number;
    order_detail?: Array<{
        order_id: number;
        product_item_id: number;
        quantity: number;
    }>;
    infoProduct?: Array<{
        order_id: number;
        product_item_id: number;
        quantity: number;
        product?: {
            product_item_id: number;
            product_id: number;
            product?: {
                product_id: number;
                product_name: string;
                category?: {
                    category_id: number;
                    category_name: string;
                };
            };
        };
    }>;
}
//# sourceMappingURL=MyOrder.d.ts.map