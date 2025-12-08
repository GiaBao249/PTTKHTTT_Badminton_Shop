"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerInfoService = void 0;
const tsyringe_1 = require("tsyringe");
const CustomerInfoRepository_1 = require("../repositories/CustomerInfoRepository");
const errorHandler_1 = require("../middleware/errorHandler");
const bcrypt_1 = __importDefault(require("bcrypt"));
let CustomerInfoService = class CustomerInfoService {
    constructor(customerInfoRepo) {
        this.customerInfoRepo = customerInfoRepo;
    }
    /**
     * Lấy customer info với addresses
     */
    async getCustomerInfo(customerId) {
        const [customer, addresses] = await Promise.all([
            this.customerInfoRepo.getCustomerById(customerId),
            this.customerInfoRepo.getAddressesByCustomerId(customerId),
        ]);
        if (!customer) {
            throw new errorHandler_1.AppError(404, "Không tìm thấy khách hàng", "CUSTOMER_NOT_FOUND");
        }
        return {
            ...customer,
            address: addresses,
        };
    }
    /**
     * Cập nhật customer info
     */
    async updateCustomer(customerId, updateDto) {
        const updateData = {};
        if (updateDto.customer_name)
            updateData.customer_name = updateDto.customer_name;
        if (updateDto.customer_phone)
            updateData.customer_phone = updateDto.customer_phone;
        if (updateDto.customer_gender)
            updateData.customer_gender = updateDto.customer_gender;
        if (updateDto.customer_email)
            updateData.customer_email = updateDto.customer_email;
        return await this.customerInfoRepo.updateCustomer(customerId, updateData);
    }
    /**
     * Đổi password
     */
    async updatePassword(customerId, updatePasswordDto) {
        const { current_password, new_password } = updatePasswordDto;
        if (!current_password || !new_password) {
            throw new errorHandler_1.AppError(400, "Thiếu thông tin đăng nhập", "VALIDATION_ERROR");
        }
        if (new_password.length < 6) {
            throw new errorHandler_1.AppError(400, "Mật khẩu mới phải có ít nhất 6 ký tự", "VALIDATION_ERROR");
        }
        // Lấy password hiện tại
        const currentPasswordHash = await this.customerInfoRepo.getCustomerPassword(customerId);
        if (!currentPasswordHash) {
            throw new errorHandler_1.AppError(404, "Không tìm thấy tài khoản", "ACCOUNT_NOT_FOUND");
        }
        // Kiểm tra password
        let isPasswordValid;
        if (typeof currentPasswordHash === "string" &&
            currentPasswordHash.startsWith("$2b$")) {
            isPasswordValid = await bcrypt_1.default.compare(current_password, currentPasswordHash);
        }
        else {
            isPasswordValid = current_password === currentPasswordHash;
        }
        if (!isPasswordValid) {
            throw new errorHandler_1.AppError(401, "Mật khẩu hiện tại không đúng", "INVALID_PASSWORD");
        }
        // Hash password mới
        const hashedPassword = await bcrypt_1.default.hash(new_password, 10);
        await this.customerInfoRepo.updatePassword(customerId, hashedPassword);
    }
    /**
     * Tạo address mới
     */
    async createAddress(customerId, addressData) {
        if (!addressData.address_line ||
            !addressData.ward ||
            !addressData.district ||
            !addressData.city) {
            throw new errorHandler_1.AppError(400, "Thiếu thông tin địa chỉ", "VALIDATION_ERROR");
        }
        return await this.customerInfoRepo.createAddress(customerId, addressData);
    }
    /**
     * Cập nhật address
     */
    async updateAddress(customerId, addressId, updateData) {
        const updateAddressData = {};
        if (updateData.address_line)
            updateAddressData.address_line = updateData.address_line;
        if (updateData.ward)
            updateAddressData.ward = updateData.ward;
        if (updateData.district)
            updateAddressData.district = updateData.district;
        if (updateData.city)
            updateAddressData.city = updateData.city;
        if (updateData.postal_code !== undefined)
            updateAddressData.postal_code = updateData.postal_code ?? undefined;
        return await this.customerInfoRepo.updateAddress(customerId, addressId, updateAddressData);
    }
};
exports.CustomerInfoService = CustomerInfoService;
exports.CustomerInfoService = CustomerInfoService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(CustomerInfoRepository_1.CustomerInfoRepository)),
    __metadata("design:paramtypes", [CustomerInfoRepository_1.CustomerInfoRepository])
], CustomerInfoService);
//# sourceMappingURL=CustomerInfoService.js.map