export interface CartItem {
    quantity: number;
    total_amount: number;
    product_item?: {
        product_item_id: number;
        product_id: number;
        quantity: number;
        product?: {
            product_id: number;
            product_name: string;
            price: number;
            is_deleted?: boolean;
            category?: {
                category_id: number;
                category_name: string;
            };
            thumbnail?: string | null;
        };
    };
}
export interface AddToCartDto {
    product_item_id: number;
    quantity: number;
}
export interface UpdateCartDto {
    product_item_id: number;
    quantity: number;
}
export interface DeleteCartItemDto {
    product_item_id: number;
}
export interface CartResponse {
    success: boolean;
    data?: any;
    message?: string;
}
//# sourceMappingURL=Cart.d.ts.map