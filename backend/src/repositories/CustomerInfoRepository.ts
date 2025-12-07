import { injectable } from "tsyringe";
import { supabase } from "../config/supabase";
import {
  CustomerInfo,
  Address,
  UpdateCustomerDto,
  CreateAddressDto,
  UpdateAddressDto,
} from "../models/CustomerInfo";

@injectable()
export class CustomerInfoRepository {
  /**
   * Lấy customer info theo ID
   */
  async getCustomerById(customerId: number): Promise<CustomerInfo | null> {
    const { data, error } = await supabase
      .from("customer")
      .select(
        `
      customer_id,
      customer_name,
      customer_gender,
      customer_phone,
      customer_email
    `
      )
      .eq("customer_id", customerId)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Lấy addresses của customer
   */
  async getAddressesByCustomerId(customerId: number): Promise<Address[]> {
    const { data, error } = await supabase
      .from("address")
      .select("*")
      .eq("customer_id", customerId)
      .order("address_id", { ascending: true });

    if (error) throw error;
    return data ?? [];
  }

  /**
   * Cập nhật customer
   */
  async updateCustomer(
    customerId: number,
    updateData: UpdateCustomerDto
  ): Promise<CustomerInfo> {
    const { data, error } = await supabase
      .from("customer")
      .update(updateData)
      .eq("customer_id", customerId)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error("Không tìm thấy customer sau khi cập nhật");
    return data;
  }

  /**
   * Lấy password của customer
   */
  async getCustomerPassword(customerId: number): Promise<string | null> {
    const { data, error } = await supabase
      .from("customeraccounts")
      .select("password")
      .eq("customer_id", customerId)
      .single();

    if (error || !data) return null;
    return data.password;
  }

  /**
   * Cập nhật password
   */
  async updatePassword(
    customerId: number,
    hashedPassword: string
  ): Promise<void> {
    const { error } = await supabase
      .from("customeraccounts")
      .update({ password: hashedPassword })
      .eq("customer_id", customerId);

    if (error) throw error;
  }

  /**
   * Tạo address mới
   */
  async createAddress(
    customerId: number,
    addressData: CreateAddressDto
  ): Promise<Address> {
    const { data, error } = await supabase
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

    if (error) throw error;
    if (!data) throw new Error("Không thể tạo địa chỉ");
    return data;
  }

  /**
   * Cập nhật address
   */
  async updateAddress(
    customerId: number,
    addressId: number,
    updateData: UpdateAddressDto
  ): Promise<Address> {
    const { data, error } = await supabase
      .from("address")
      .update(updateData)
      .eq("address_id", addressId)
      .eq("customer_id", customerId)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error("Không tìm thấy địa chỉ");
    return data;
  }
}

