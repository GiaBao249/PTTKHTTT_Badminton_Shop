import { CustomerRepository } from "../repositories/CustomerRepository";
import { CustomerWithStats } from "../models/Customer";
export declare class CustomerService {
    private customerRepo;
    constructor(customerRepo: CustomerRepository);
    getAllCustomerWithStats(): Promise<CustomerWithStats[]>;
    getCustomerByIdWithStats(customerId: number): Promise<CustomerWithStats>;
}
//# sourceMappingURL=CustomerService.d.ts.map