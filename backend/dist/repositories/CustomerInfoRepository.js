"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerInfoRepository = void 0;
const tsyringe_1 = require("tsyringe");
const supabase_1 = require("../config/supabase");
let CustomerInfoRepository = class CustomerInfoRepository {
    /**
     * Lấy customer info theo ID
     */
    async getCustomerById(customerId) {
        const { data, error } = await supabase_1.supabase
            .from("customer")
            .select(`
      customer_id,
      customer_name,
      customer_gender,
      customer_phone,
      customer_email
    `)
            .eq("customer_id", customerId)
            .single();
        if (error)
            throw error;
        return data;
    }
    /**
     * Lấy addresses của customer
     */
    async getAddressesByCustomerId(customerId) {
        const { data, error } = await supabase_1.supabase
            .from("address")
            .select("*")
            .eq("customer_id", customerId)
            .order("address_id", { ascending: true });
        if (error)
            throw error;
        return data ?? [];
    }
    /**
     * Cập nhật customer
     */
    async updateCustomer(customerId, updateData) {
        const { data, error } = await supabase_1.supabase
            .from("customer")
            .update(updateData)
            .eq("customer_id", customerId)
            .select()
            .single();
        if (error)
            throw error;
        if (!data)
            throw new Error("Không tìm thấy customer sau khi cập nhật");
        return data;
    }
    /**
     * Lấy password của customer
     */
    async getCustomerPassword(customerId) {
        const { data, error } = await supabase_1.supabase
            .from("customeraccounts")
            .select("password")
            .eq("customer_id", customerId)
            .single();
        if (error || !data)
            return null;
        return data.password;
    }
    /**
     * Cập nhật password
     */
    async updatePassword(customerId, hashedPassword) {
        const { error } = await supabase_1.supabase
            .from("customeraccounts")
            .update({ password: hashedPassword })
            .eq("customer_id", customerId);
        if (error)
            throw error;
    }
    /**
     * Tạo address mới
     */
    async createAddress(customerId, addressData) {
        const { data, error } = await supabase_1.supabase
            .from("address")
            .insert([
            {
                customer_id: customerId,
                address_line: addressData.address_line,
                ward: addressData.ward || null,
                district: addressData.district,
                city: addressData.city,
                postal_code: addressData.postal_code || null,
            },
        ])
            .select()
            .single();
        if (error)
            throw error;
        if (!data)
            throw new Error("Không thể tạo địa chỉ");
        return data;
    }
    /**
     * Cập nhật address
     */
    async updateAddress(customerId, addressId, updateData) {
        const { data, error } = await supabase_1.supabase
            .from("address")
            .update(updateData)
            .eq("address_id", addressId)
            .eq("customer_id", customerId)
            .select()
            .single();
        if (error)
            throw error;
        if (!data)
            throw new Error("Không tìm thấy địa chỉ");
        return data;
    }
};
exports.CustomerInfoRepository = CustomerInfoRepository;
exports.CustomerInfoRepository = CustomerInfoRepository = __decorate([
    (0, tsyringe_1.injectable)()
], CustomerInfoRepository);
//# sourceMappingURL=CustomerInfoRepository.js.map