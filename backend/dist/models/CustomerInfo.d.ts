export interface CustomerInfo {
    customer_id: number;
    customer_name: string;
    customer_gender?: string;
    customer_phone?: string;
    customer_email?: string;
    address?: Address[];
}
export interface Address {
    address_id: number;
    customer_id: number;
    address_line: string;
    ward?: string;
    district: string;
    city: string;
    postal_code?: string;
}
export interface UpdateCustomerDto {
    customer_name?: string;
    customer_phone?: string;
    customer_gender?: string;
    customer_email?: string;
}
export interface UpdatePasswordDto {
    current_password: string;
    new_password: string;
}
export interface CreateAddressDto {
    address_line: string;
    ward?: string;
    district: string;
    city: string;
    postal_code?: string;
}
export interface UpdateAddressDto {
    address_line?: string;
    ward?: string;
    district?: string;
    city?: string;
    postal_code?: string;
}
//# sourceMappingURL=CustomerInfo.d.ts.map