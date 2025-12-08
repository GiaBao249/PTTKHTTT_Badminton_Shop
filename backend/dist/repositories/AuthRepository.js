"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRepository = void 0;
const tsyringe_1 = require("tsyringe");
const supabase_1 = require("../config/supabase");
let AuthRepository = class AuthRepository {
    async findCustomerAccount(username) {
        const { data, error } = await supabase_1.supabase
            .from("customeraccounts")
            .select(`username, password, customer_id, customer(customer_name)`)
            .eq("username", username)
            .single();
        if (error || !data) {
            return null;
        }
        return data;
    }
    async findAdminAccount(username) {
        const { data, error } = await supabase_1.supabase
            .from("adminaccounts")
            .select(`username, password, id, employee_id, employees(name)`)
            .eq("username", username)
            .single();
        if (error || !data)
            return null;
        return data;
    }
    async checkUsernameExists(username, accountTable) {
        const { data } = await supabase_1.supabase
            .from(accountTable)
            .select("username")
            .eq("username", username)
            .single();
        return !!data;
    }
    async createCustomer(customerData) {
        const { data, error } = await supabase_1.supabase
            .from("customer")
            .insert([customerData])
            .select("customer_id")
            .single();
        if (error)
            throw error;
        if (!data)
            throw new Error("Không thể tạo customer");
        return data;
    }
    async createEmployee(employeeData) {
        const { data, error } = await supabase_1.supabase
            .from("employees")
            .insert([employeeData])
            .select("employ_id")
            .single();
        if (error)
            throw error;
        if (!data)
            throw new Error("Không thể tạo employee");
        return data;
    }
    async createCustomerAccount(username, hashedPassword, customerId) {
        const { error } = await supabase_1.supabase.from("customeraccounts").insert([
            {
                username,
                password: hashedPassword,
                customer_id: customerId,
            },
        ]);
        if (error)
            throw error;
    }
    async createAdminAccount(username, hashedPassword, employeeId) {
        const { error } = await supabase_1.supabase.from("adminaccounts").insert([
            {
                username,
                password: hashedPassword,
                employee_id: employeeId,
            },
        ]);
        if (error)
            throw error;
    }
    async updatePassword(username, hashedPassword, accountTable) {
        const { error } = await supabase_1.supabase
            .from(accountTable)
            .update({ password: hashedPassword })
            .eq("username", username);
        if (error)
            throw error;
    }
    async deleteCustomer(customerId) {
        const { error } = await supabase_1.supabase
            .from("customer")
            .delete()
            .eq("customer_id", customerId);
        if (error)
            throw error;
    }
    async deleteEmployee(employeeId) {
        const { error } = await supabase_1.supabase
            .from("employees")
            .delete()
            .eq("employ_id", employeeId);
        if (error)
            throw error;
    }
    /**
     * Lấy AccountMeta dựa trên role và account data
     */
    getAccountMeta(role, account) {
        if (role === "user") {
            return {
                accountTable: "customeraccounts",
                joinTable: "customer",
                idField: "customer_id",
                nameField: "customer_name",
                infoIdField: "customer_id",
            };
        }
        else {
            return {
                accountTable: "adminaccounts",
                joinTable: "employees",
                idField: "id", // Dùng adminaccounts.id
                nameField: "name",
                infoIdField: "employ_id",
            };
        }
    }
};
exports.AuthRepository = AuthRepository;
exports.AuthRepository = AuthRepository = __decorate([
    (0, tsyringe_1.injectable)()
], AuthRepository);
//# sourceMappingURL=AuthRepository.js.map