import { injectable, inject } from "tsyringe";
import { InvoiceRepository } from "../repositories/InvoiceRepository";
import { Invoice, GetInvoicesQuery } from "../models/Invoice";
import { AppError } from "../middleware/errorHandler";

@injectable()
export class InvoiceService {
  constructor(
    @inject(InvoiceRepository) private invoiceRepo: InvoiceRepository
  ) {}

  async getInvoices(filters: GetInvoicesQuery): Promise<Invoice[]> {
    const orders = await this.invoiceRepo.findOrdersWithFilter(filters);

    if (orders.length === 0) {
      return [];
    }

    const customerIds = [
      ...new Set(orders.map((o: any) => o.customer_id).filter(Boolean)),
    ];
    const orderIds = orders.map((o: any) => o.order_id).filter(Boolean);

    const [customerMap, orderDetails] = await Promise.all([
      this.invoiceRepo.getCustomerByIds(customerIds),
      this.invoiceRepo.getOrderDetailsByOrderIds(orderIds),
    ]);

    const productItemIds = [
      ...new Set(
        orderDetails.map((od: any) => od?.product_item_id).filter(Boolean)
      ),
    ];

    if (productItemIds.length === 0) {
      return orders.map((order: any) => ({
        ...order,
        customer: customerMap.get(order.customer_id) || null,
        orderdetail: [],
      }));
    }

    const productItemMap = await this.invoiceRepo.getProductItemsByIds(
      productItemIds
    );

    const productIds = [
      ...new Set(
        Array.from(productItemMap.values())
          .map((pi: any) => pi.product_id)
          .filter(Boolean)
      ),
    ];

    const productMap =
      await this.invoiceRepo.getProductsWithCategoriesAndImages(productIds);

    const orderDetailsWithProducts = orderDetails.map((detail: any) => {
      const productItem = productItemMap.get(detail.product_item_id);
      const product = productItem
        ? productMap.get(productItem.product_id)
        : null;

      return {
        ...detail,
        product_item: productItem
          ? {
              ...productItem,
              product: product || null,
            }
          : null,
      };
    });

    const orderDetailsByOrderId = new Map<number, any[]>();
    orderDetailsWithProducts.forEach((detail: any) => {
      const orderId = detail.order_id;
      if (!orderDetailsByOrderId.has(orderId)) {
        orderDetailsByOrderId.set(orderId, []);
      }
      orderDetailsByOrderId.get(orderId)!.push(detail);
    });

    return orders.map((order: any) => ({
      ...order,
      customer: customerMap.get(order.customer_id) || null,
      orderdetail: orderDetailsByOrderId.get(order.order_id) || [],
    }));
  }

  async getInvoiceByOrderId(
    orderId: number,
    userId?: number,
    userRole?: string
  ): Promise<Invoice> {
    const order = await this.invoiceRepo.findOrderById(orderId);

    if (!order) {
      throw new AppError(404, "Không tìm thấy hóa đơn", "INVOICE_NOT_FOUND");
    }

    if (userRole === "user" && order.customer_id !== userId) {
      throw new AppError(
        403,
        "Bạn không có quyền xem hóa đơn này",
        "FORBIDDEN"
      );
    }

    const customerMap = await this.invoiceRepo.getCustomerByIds([
      order.customer_id,
    ]);
    const customer = customerMap.get(order.customer_id) || null;

    const orderDetails = await this.invoiceRepo.getOrderDetailsByOrderIds([
      orderId,
    ]);

    if (orderDetails.length === 0) {
      return {
        ...order,
        customer,
        orderdetail: [],
      };
    }

    const productItemIds = [
      ...new Set(
        orderDetails.map((od: any) => od?.product_item_id).filter(Boolean)
      ),
    ];

    const [productItemMap, productMap] = await Promise.all([
      this.invoiceRepo.getProductItemsByIds(productItemIds),
      (async () => {
        const productItems = await this.invoiceRepo.getProductItemsByIds(
          productItemIds
        );
        const productIds = [
          ...new Set(
            Array.from(productItems.values())
              .map((pi: any) => pi.product_id)
              .filter(Boolean)
          ),
        ];
        return await this.invoiceRepo.getProductsWithCategoriesAndImages(
          productIds
        );
      })(),
    ]);

    const orderDetailsWithProducts = orderDetails.map((detail: any) => {
      const productItem = productItemMap.get(detail.product_item_id);
      const product = productItem
        ? productMap.get(productItem.product_id)
        : null;

      return {
        ...detail,
        product_item: productItem
          ? {
              ...productItem,
              product: product || null,
            }
          : null,
      };
    });

    return {
      ...order,
      customer,
      orderdetail: orderDetailsWithProducts,
    };
  }
}
