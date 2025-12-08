import { Employee } from "../models/Employee";
export declare class EmployeeRepository {
    findAll(): Promise<Employee[]>;
    findById(employeeId: number): Promise<Employee | null>;
    findByIds(employeeIds: number[]): Promise<Employee[]>;
}
//# sourceMappingURL=EmployeeRepository.d.ts.map