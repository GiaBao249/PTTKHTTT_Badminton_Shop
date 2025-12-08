import { InvoiceRepository } from "../repositories/InvoiceRepository";
import { Invoice, GetInvoicesQuery } from "../models/Invoice";
export declare class InvoiceService {
    private invoiceRepo;
    constructor(invoiceRepo: InvoiceRepository);
    getInvoices(filters: GetInvoicesQuery): Promise<Invoice[]>;
    getInvoiceByOrderId(orderId: number, userId?: number, userRole?: string): Promise<Invoice>;
}
//# sourceMappingURL=InvoiceService.d.ts.map