import { GetInvoicesQuery } from "../services/Invoice";
export declare class InvoiceRepository {
    findOrdersWithFilter(filter: GetInvoicesQuery): Promise<any[]>;
    findOrderById(orderId: number): Promise<any | null>;
    getCustomerByIds(customerIds: number[]): Promise<Map<number, any>>;
    getOrderDetailsByOrderIds(orderIds: number[]): Promise<any[]>;
    getProductsWithCategoriesAndImages(productIds: number[]): Promise<Map<number, any>>;
    getProductItemsByIds(productItemIds: number[]): Promise<Map<number, any>>;
}
//# sourceMappingURL=InvoiceRepository.d.ts.map