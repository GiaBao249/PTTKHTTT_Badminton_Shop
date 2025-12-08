import { injectable } from "tsyringe";
import { supabase } from "../config/supabase";
import { access } from "fs";
import { AccountMeta, UserRole } from "../models/Auth";

@injectable()
export class AuthRepository {
  async findCustomerAccount(username: string): Promise<any | null> {
    const { data, error } = await supabase
      .from("customeraccounts")
      .select(`username, password, customer_id, customer(customer_name)`)
      .eq("username", username)
      .single();
    if (error || !data) {
      return null;
    }
    return data;
  }
  async findAdminAccount(username: string): Promise<any | null> {
    const { data, error } = await supabase
      .from("adminaccounts")
      .select(`username, password, id, employee_id, employees(name)`)
      .eq("username", username)
      .single();

    if (error || !data) return null;
    return data;
  }
  async checkUsernameExists(
    username: string,
    accountTable: "customeraccounts" | "adminaccounts"
  ): Promise<boolean> {
    const { data } = await supabase
      .from(accountTable)
      .select("username")
      .eq("username", username)
      .single();
    return !!data;
  }
  async createCustomer(customerData: {
    customer_name: string;
    customer_phone?: string;
    customer_gender?: string;
  }): Promise<{ customer_id: number }> {
    const { data, error } = await supabase
      .from("customer")
      .insert([customerData])
      .select("customer_id")
      .single();

    if (error) throw error;
    if (!data) throw new Error("Không thể tạo customer");
    return data;
  }
  async createEmployee(employeeData: {
    name: string;
    phone?: string;
  }): Promise<{ employ_id: number }> {
    const { data, error } = await supabase
      .from("employees")
      .insert([employeeData])
      .select("employ_id")
      .single();

    if (error) throw error;
    if (!data) throw new Error("Không thể tạo employee");
    return data;
  }
  async createCustomerAccount(
    username: string,
    hashedPassword: string,
    customerId: number
  ): Promise<void> {
    const { error } = await supabase.from("customeraccounts").insert([
      {
        username,
        password: hashedPassword,
        customer_id: customerId,
      },
    ]);

    if (error) throw error;
  }
  async createAdminAccount(
    username: string,
    hashedPassword: string,
    employeeId: number
  ): Promise<void> {
    const { error } = await supabase.from("adminaccounts").insert([
      {
        username,
        password: hashedPassword,
        employee_id: employeeId,
      },
    ]);

    if (error) throw error;
  }
  async updatePassword(
    username: string,
    hashedPassword: string,
    accountTable: "customeraccounts" | "adminaccounts"
  ): Promise<void> {
    const { error } = await supabase
      .from(accountTable)
      .update({ password: hashedPassword })
      .eq("username", username);

    if (error) throw error;
  }
  async deleteCustomer(customerId: number): Promise<void> {
    const { error } = await supabase
      .from("customer")
      .delete()
      .eq("customer_id", customerId);

    if (error) throw error;
  }
  async deleteEmployee(employeeId: number): Promise<void> {
    const { error } = await supabase
      .from("employees")
      .delete()
      .eq("employ_id", employeeId);

    if (error) throw error;
  }
  /**
   * Lấy AccountMeta dựa trên role và account data
   */
  getAccountMeta(role: UserRole, account: any): AccountMeta {
    if (role === "user") {
      return {
        accountTable: "customeraccounts",
        joinTable: "customer",
        idField: "customer_id",
        nameField: "customer_name",
        infoIdField: "customer_id",
      };
    } else {
      return {
        accountTable: "adminaccounts",
        joinTable: "employees",
        idField: "id", // Dùng adminaccounts.id
        nameField: "name",
        infoIdField: "employ_id",
      };
    }
  }
}
