import { Request, Response } from "express";
import { EmployeeService } from "../services/EmployeeService";
export declare class EmployeeController {
    private employeeService;
    constructor(employeeService: EmployeeService);
    getAllEmployees: (req: Request, res: Response) => Promise<void>;
    getEmployeeById: (req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=EmployeeController.d.ts.map