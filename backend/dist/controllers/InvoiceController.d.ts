import { Request, Response } from "express";
import { InvoiceService } from "../services/InvoiceService";
export declare class InvoiceController {
    private invoiceService;
    constructor(invoiceService: InvoiceService);
    getInvoices: (req: Request, res: Response) => Promise<void>;
    getInvoiceByOrderId: (req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=InvoiceController.d.ts.map