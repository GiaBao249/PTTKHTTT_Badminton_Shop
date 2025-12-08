export interface CheckoutItem {
    product_item_id: number;
    quantity: number;
    total_amount?: number;
    price?: number;
}
export interface ShippingInfo {
    address: string;
    ward?: string;
    district: string;
    city: string;
    postalCode?: string;
}
export interface CheckoutDto {
    cart_items: CheckoutItem[];
    address_id?: number;
    shipping_info?: ShippingInfo;
    payment_method: "cod" | "vnpay" | "vietqr" | "card";
    total_amount: number;
}
export interface CheckoutResponse {
    success: boolean;
    order_id: number;
    message: string;
    payment_method: string;
    requires_payment?: boolean;
}
//# sourceMappingURL=Checkout.d.ts.map