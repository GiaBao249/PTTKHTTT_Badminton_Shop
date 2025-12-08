import { EmployeeRepository } from "../repositories/EmployeeRepository";
import { Employee } from "../models/Employee";
export declare class EmployeeService {
    private employeeRepo;
    constructor(employeeRepo: EmployeeRepository);
    getAllEmployees(): Promise<Employee[]>;
    getEmployeeById(employeeId: number): Promise<Employee>;
}
//# sourceMappingURL=EmployeeService.d.ts.map