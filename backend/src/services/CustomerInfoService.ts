import { injectable, inject } from "tsyringe";
import { CustomerInfoRepository } from "../repositories/CustomerInfoRepository";
import {
  CustomerInfo,
  UpdateCustomerDto,
  UpdatePasswordDto,
  CreateAddressDto,
  UpdateAddressDto,
} from "../models/CustomerInfo";
import { AppError } from "../middleware/errorHandler";
import bcrypt from "bcrypt";

@injectable()
export class CustomerInfoService {
  constructor(
    @inject(CustomerInfoRepository)
    private customerInfoRepo: CustomerInfoRepository
  ) {}

  /**
   * Lấy customer info với addresses
   */
  async getCustomerInfo(customerId: number): Promise<CustomerInfo> {
    const [customer, addresses] = await Promise.all([
      this.customerInfoRepo.getCustomerById(customerId),
      this.customerInfoRepo.getAddressesByCustomerId(customerId),
    ]);

    if (!customer) {
      throw new AppError(404, "Không tìm thấy khách hàng", "CUSTOMER_NOT_FOUND");
    }

    return {
      ...customer,
      address: addresses,
    };
  }

  /**
   * Cập nhật customer info
   */
  async updateCustomer(
    customerId: number,
    updateDto: UpdateCustomerDto
  ): Promise<CustomerInfo> {
    const updateData: UpdateCustomerDto = {};
    if (updateDto.customer_name) updateData.customer_name = updateDto.customer_name;
    if (updateDto.customer_phone) updateData.customer_phone = updateDto.customer_phone;
    if (updateDto.customer_gender) updateData.customer_gender = updateDto.customer_gender;
    if (updateDto.customer_email) updateData.customer_email = updateDto.customer_email;

    return await this.customerInfoRepo.updateCustomer(customerId, updateData);
  }

  /**
   * Đổi password
   */
  async updatePassword(
    customerId: number,
    updatePasswordDto: UpdatePasswordDto
  ): Promise<void> {
    const { current_password, new_password } = updatePasswordDto;

    if (!current_password || !new_password) {
      throw new AppError(400, "Thiếu thông tin đăng nhập", "VALIDATION_ERROR");
    }

    if (new_password.length < 6) {
      throw new AppError(
        400,
        "Mật khẩu mới phải có ít nhất 6 ký tự",
        "VALIDATION_ERROR"
      );
    }

    // Lấy password hiện tại
    const currentPasswordHash = await this.customerInfoRepo.getCustomerPassword(
      customerId
    );

    if (!currentPasswordHash) {
      throw new AppError(404, "Không tìm thấy tài khoản", "ACCOUNT_NOT_FOUND");
    }

    // Kiểm tra password
    let isPasswordValid: boolean;
    if (
      typeof currentPasswordHash === "string" &&
      currentPasswordHash.startsWith("$2b$")
    ) {
      isPasswordValid = await bcrypt.compare(
        current_password,
        currentPasswordHash
      );
    } else {
      isPasswordValid = current_password === currentPasswordHash;
    }

    if (!isPasswordValid) {
      throw new AppError(
        401,
        "Mật khẩu hiện tại không đúng",
        "INVALID_PASSWORD"
      );
    }

    // Hash password mới
    const hashedPassword = await bcrypt.hash(new_password, 10);
    await this.customerInfoRepo.updatePassword(customerId, hashedPassword);
  }

  /**
   * Tạo address mới
   */
  async createAddress(
    customerId: number,
    addressData: CreateAddressDto
  ): Promise<any> {
    if (
      !addressData.address_line ||
      !addressData.ward ||
      !addressData.district ||
      !addressData.city
    ) {
      throw new AppError(400, "Thiếu thông tin địa chỉ", "VALIDATION_ERROR");
    }

    return await this.customerInfoRepo.createAddress(customerId, addressData);
  }

  /**
   * Cập nhật address
   */
  async updateAddress(
    customerId: number,
    addressId: number,
    updateData: UpdateAddressDto
  ): Promise<any> {
    const updateAddressData: UpdateAddressDto = {};
    if (updateData.address_line) updateAddressData.address_line = updateData.address_line;
    if (updateData.ward) updateAddressData.ward = updateData.ward;
    if (updateData.district) updateAddressData.district = updateData.district;
    if (updateData.city) updateAddressData.city = updateData.city;
    if (updateData.postal_code !== undefined)
      updateAddressData.postal_code = updateData.postal_code || null;

    return await this.customerInfoRepo.updateAddress(
      customerId,
      addressId,
      updateAddressData
    );
  }
}

