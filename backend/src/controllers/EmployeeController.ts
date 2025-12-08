import { injectable, inject } from "tsyringe";
import { Request, Response } from "express";
import { EmployeeService } from "../services/EmployeeService";
import { AppError } from "../middleware/errorHandler";

@injectable()
export class EmployeeController {
  constructor(
    @inject(EmployeeService) private employeeService: EmployeeService
  ) {}

  getAllEmployees = async (req: Request, res: Response): Promise<void> => {
    try {
      const employees = await this.employeeService.getAllEmployees();
      res.json(employees);
    } catch (error: any) {
      if (error instanceof AppError) {
        res
          .status(error.statusCode)
          .json({ error: error.message, code: error.code });
      } else {
        console.error("Error getting employees:", error);
        res.status(500).json({ error: "Lỗi server khi lấy nhân viên" });
      }
    }
  };

  getEmployeeById = async (req: Request, res: Response): Promise<void> => {
    try {
      const employeeId = parseInt(req.params.id || "0");
      if (isNaN(employeeId)) {
        res.status(400).json({ error: "Invalid employee ID" });
        return;
      }

      const employee = await this.employeeService.getEmployeeById(employeeId);
      res.json(employee);
    } catch (error: any) {
      if (error instanceof AppError) {
        res
          .status(error.statusCode)
          .json({ error: error.message, code: error.code });
      } else {
        console.error("Error getting employee:", error);
        res.status(500).json({ error: "Lỗi server khi lấy nhân viên" });
      }
    }
  };
}
