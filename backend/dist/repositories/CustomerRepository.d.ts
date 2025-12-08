import { Customer } from "../models/Customer";
export declare class CustomerRepository {
    findAll(): Promise<Customer[]>;
    findById(customerId: number): Promise<Customer | null>;
    getOrdersStats(): Promise<Map<number, {
        total_orders: number;
        total_spent: number;
    }>>;
}
//# sourceMappingURL=CustomerRepository.d.ts.map