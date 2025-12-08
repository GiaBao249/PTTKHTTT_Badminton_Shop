import { AccountMeta, UserRole } from "../models/Auth";
export declare class AuthRepository {
    findCustomerAccount(username: string): Promise<any | null>;
    findAdminAccount(username: string): Promise<any | null>;
    checkUsernameExists(username: string, accountTable: "customeraccounts" | "adminaccounts"): Promise<boolean>;
    createCustomer(customerData: {
        customer_name: string;
        customer_phone?: string;
        customer_gender?: string;
    }): Promise<{
        customer_id: number;
    }>;
    createEmployee(employeeData: {
        name: string;
        phone?: string;
    }): Promise<{
        employ_id: number;
    }>;
    createCustomerAccount(username: string, hashedPassword: string, customerId: number): Promise<void>;
    createAdminAccount(username: string, hashedPassword: string, employeeId: number): Promise<void>;
    updatePassword(username: string, hashedPassword: string, accountTable: "customeraccounts" | "adminaccounts"): Promise<void>;
    deleteCustomer(customerId: number): Promise<void>;
    deleteEmployee(employeeId: number): Promise<void>;
    /**
     * Lấy AccountMeta dựa trên role và account data
     */
    getAccountMeta(role: UserRole, account: any): AccountMeta;
}
//# sourceMappingURL=AuthRepository.d.ts.map