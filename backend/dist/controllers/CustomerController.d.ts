import { Request, Response } from "express";
import { CustomerService } from "../services/CustomerService";
export declare class CustomerController {
    private customerService;
    constructor(customerService: CustomerService);
    getAllCustomers: (req: Request, res: Response) => Promise<void>;
    getCustomerById: (req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=CustomerController.d.ts.map