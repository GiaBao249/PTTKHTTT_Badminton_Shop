import { Request, Response } from "express";
import { InvoiceService } from "../services/InvoiceService";
import { AppError } from "../middleware/errorHandler";
import { GetInvoicesQuery } from "../models/Invoice";
import { inject, injectable } from "tsyringe";

@injectable()
export class InvoiceController {
  constructor(@inject(InvoiceService) private invoiceService: InvoiceService) {}

  getInvoices = async (req: Request, res: Response): Promise<void> => {
    try {
      const filters: GetInvoicesQuery = {
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        status: req.query.status as string,
      };

      const invoices = await this.invoiceService.getInvoices(filters);
      res.json(invoices);
    } catch (error: any) {
      if (error instanceof AppError) {
        res
          .status(error.statusCode)
          .json({ error: error.message, code: error.code });
      } else {
        console.error("Error getting invoices:", error);
        res.status(500).json({ error: "Lỗi khi lấy hóa đơn" });
      }
    }
  };

  getInvoiceByOrderId = async (req: Request, res: Response): Promise<void> => {
    try {
      const orderId = parseInt(req.params.orderId);
      if (isNaN(orderId)) {
        res.status(400).json({ error: "Invalid order ID" });
        return;
      }

      const user = (req as any).user;
      const invoice = await this.invoiceService.getInvoiceByOrderId(
        orderId,
        user?.id,
        user?.role
      );

      res.json(invoice);
    } catch (error: any) {
      if (error instanceof AppError) {
        res
          .status(error.statusCode)
          .json({ error: error.message, code: error.code });
      } else {
        console.error("Error getting invoice:", error);
        res.status(500).json({ error: "Lỗi khi lấy hóa đơn" });
      }
    }
  };
}
