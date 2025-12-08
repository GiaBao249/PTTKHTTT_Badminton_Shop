export interface Customer {
    customer_id: number;
    customer_name: string;
    customer_gender?: string;
    customer_phone?: string;
}
export interface CustomerWithStats extends Customer {
    total_orders: number;
    total_spent: number;
}
//# sourceMappingURL=Customer.d.ts.map