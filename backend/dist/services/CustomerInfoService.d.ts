import { CustomerInfoRepository } from "../repositories/CustomerInfoRepository";
import { CustomerInfo, UpdateCustomerDto, UpdatePasswordDto, CreateAddressDto, UpdateAddressDto } from "../models/CustomerInfo";
export declare class CustomerInfoService {
    private customerInfoRepo;
    constructor(customerInfoRepo: CustomerInfoRepository);
    /**
     * Lấy customer info với addresses
     */
    getCustomerInfo(customerId: number): Promise<CustomerInfo>;
    /**
     * Cập nhật customer info
     */
    updateCustomer(customerId: number, updateDto: UpdateCustomerDto): Promise<CustomerInfo>;
    /**
     * Đổi password
     */
    updatePassword(customerId: number, updatePasswordDto: UpdatePasswordDto): Promise<void>;
    /**
     * Tạo address mới
     */
    createAddress(customerId: number, addressData: CreateAddressDto): Promise<any>;
    /**
     * Cập nhật address
     */
    updateAddress(customerId: number, addressId: number, updateData: UpdateAddressDto): Promise<any>;
}
//# sourceMappingURL=CustomerInfoService.d.ts.map