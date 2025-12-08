import { injectable, inject } from "tsyringe";
import { Request, Response } from "express";
import { CustomerInfoService } from "../services/CustomerInfoService";
import {
  UpdateCustomerDto,
  UpdatePasswordDto,
  CreateAddressDto,
  UpdateAddressDto,
} from "../models/CustomerInfo";
import { AppError } from "../middleware/errorHandler";

@injectable()
export class CustomerInfoController {
  constructor(
    @inject(CustomerInfoService)
    private customerInfoService: CustomerInfoService
  ) {}

  /**
   * GET /api/info/:id
   * Lấy customer info với addresses
   */
  getCustomerInfo = async (req: Request, res: Response): Promise<void> => {
    try {
      const idParam = req.params.id;
      if (!idParam) {
        res.status(400).json({ error: "Customer ID is required" });
        return;
      }

      const customerId = parseInt(idParam, 10);
      if (isNaN(customerId)) {
        res.status(400).json({ error: "Invalid customer ID" });
        return;
      }

      const user = (req as any).user;
      if (user.role === "user" && user.id !== customerId) {
        res.status(403).json({ error: "không có quyền truy cập" });
        return;
      }

      const customerInfo = await this.customerInfoService.getCustomerInfo(
        customerId
      );
      res.json(customerInfo);
    } catch (error: any) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          error: error.message,
          code: error.code,
        });
      } else {
        console.error("Error getting customer info:", error);
        res.status(500).json({
          error: error.message || "Lỗi server",
        });
      }
    }
  };

  /**
   * PUT /api/info/:id
   * Cập nhật customer info
   */
  updateCustomer = async (req: Request, res: Response): Promise<void> => {
    try {
      const idParam = req.params.id;
      if (!idParam) {
        res.status(400).json({ error: "Customer ID is required" });
        return;
      }

      const customerId = parseInt(idParam, 10);
      if (isNaN(customerId)) {
        res.status(400).json({ error: "Invalid customer ID" });
        return;
      }

      const user = (req as any).user;
      if (user.role !== "user" || user.id !== customerId) {
        res.status(403).json({ error: "Không có quyền truy cập" });
        return;
      }

      const updateDto: UpdateCustomerDto = req.body;
      const result = await this.customerInfoService.updateCustomer(
        customerId,
        updateDto
      );
      res.json(result);
    } catch (error: any) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          error: error.message,
          code: error.code,
        });
      } else {
        console.error("Error updating customer:", error);
        res.status(500).json({
          error: error.message || "Lỗi server",
        });
      }
    }
  };

  /**
   * PUT /api/info/:id/password
   * Đổi password
   */
  updatePassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const idParam = req.params.id;
      if (!idParam) {
        res.status(400).json({ error: "Customer ID is required" });
        return;
      }

      const customerId = parseInt(idParam, 10);
      if (isNaN(customerId)) {
        res.status(400).json({ error: "Invalid customer ID" });
        return;
      }

      const user = (req as any).user;
      if (user.role === "user" && Number(user.id) !== customerId) {
        res.status(403).json({ error: "Không có quyền truy cập" });
        return;
      }

      const updatePasswordDto: UpdatePasswordDto = req.body;
      await this.customerInfoService.updatePassword(
        customerId,
        updatePasswordDto
      );
      res.json({ message: "Đổi mật khẩu thành công" });
    } catch (error: any) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          error: error.message,
          code: error.code,
        });
      } else {
        console.error("Error updating password:", error);
        res.status(500).json({
          error: error.message || "Lỗi server",
        });
      }
    }
  };

  /**
   * POST /api/info/:id/address
   * Tạo address mới
   */
  createAddress = async (req: Request, res: Response): Promise<void> => {
    try {
      const idParam = req.params.id;
      if (!idParam) {
        res.status(400).json({ error: "Customer ID is required" });
        return;
      }

      const customerId = parseInt(idParam, 10);
      if (isNaN(customerId)) {
        res.status(400).json({ error: "Invalid customer ID" });
        return;
      }

      const user = (req as any).user;
      if (user.role === "user" && Number(user.id) !== customerId) {
        res.status(403).json({ error: "Không có quyền truy cập" });
        return;
      }

      const addressData: CreateAddressDto = req.body;
      const result = await this.customerInfoService.createAddress(
        customerId,
        addressData
      );
      res.status(201).json(result);
    } catch (error: any) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          error: error.message,
          code: error.code,
        });
      } else {
        console.error("Error creating address:", error);
        res.status(500).json({
          error: error.message || "Lỗi server",
        });
      }
    }
  };

  /**
   * PUT /api/info/:id/address/:addressId
   * Cập nhật address
   */
  updateAddress = async (req: Request, res: Response): Promise<void> => {
    try {
      const idParam = req.params.id;
      const addressIdParam = req.params.addressId;
      if (!idParam || !addressIdParam) {
        res
          .status(400)
          .json({ error: "Customer ID and Address ID are required" });
        return;
      }

      const customerId = parseInt(idParam, 10);
      const addressId = parseInt(addressIdParam, 10);
      if (isNaN(customerId) || isNaN(addressId)) {
        res.status(400).json({ error: "Invalid ID" });
        return;
      }

      const user = (req as any).user;
      if (user.role === "user" && Number(user.id) !== customerId) {
        res.status(403).json({ error: "Không có quyền truy cập" });
        return;
      }

      const updateData: UpdateAddressDto = req.body;
      const result = await this.customerInfoService.updateAddress(
        customerId,
        addressId,
        updateData
      );
      res.json(result);
    } catch (error: any) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          error: error.message,
          code: error.code,
        });
      } else {
        console.error("Error updating address:", error);
        res.status(500).json({
          error: error.message || "Lỗi server",
        });
      }
    }
  };
}

