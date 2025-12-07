import { injectable, inject } from "tsyringe";
import { EmployeeRepository } from "../repositories/EmployeeRepository";
import { Employee } from "../models/Employee";
import { AppError } from "../middleware/errorHandler";

@injectable()
export class EmployeeService {
  constructor(
    @inject(EmployeeRepository) private employeeRepo: EmployeeRepository
  ) {}

  async getAllEmployees(): Promise<Employee[]> {
    const employees = await this.employeeRepo.findAll();

    return employees.map((emp) => ({
      ...emp,
      employee_id: emp.employ_id,
    }));
  }

  async getEmployeeById(employeeId: number): Promise<Employee> {
    const employee = await this.employeeRepo.findById(employeeId);
    if (!employee) {
      throw new AppError(404, "Không tìm thấy nhân viên", "EMPLOYEE_NOT_FOUND");
    }

    return {
      ...employee,
      employee_id: employee.employ_id,
    };
  }
}
