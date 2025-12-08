import { CustomerInfo, Address, UpdateCustomerDto, CreateAddressDto, UpdateAddressDto } from "../models/CustomerInfo";
export declare class CustomerInfoRepository {
    /**
     * Lấy customer info theo ID
     */
    getCustomerById(customerId: number): Promise<CustomerInfo | null>;
    /**
     * Lấy addresses của customer
     */
    getAddressesByCustomerId(customerId: number): Promise<Address[]>;
    /**
     * Cập nhật customer
     */
    updateCustomer(customerId: number, updateData: UpdateCustomerDto): Promise<CustomerInfo>;
    /**
     * Lấy password của customer
     */
    getCustomerPassword(customerId: number): Promise<string | null>;
    /**
     * Cập nhật password
     */
    updatePassword(customerId: number, hashedPassword: string): Promise<void>;
    /**
     * Tạo address mới
     */
    createAddress(customerId: number, addressData: CreateAddressDto): Promise<Address>;
    /**
     * Cập nhật address
     */
    updateAddress(customerId: number, addressId: number, updateData: UpdateAddressDto): Promise<Address>;
}
//# sourceMappingURL=CustomerInfoRepository.d.ts.map