import { injectable, inject } from "tsyringe";
import { MyOrderRepository } from "../repositories/MyOrderRepository";
import { MyOrder } from "../models/MyOrder";
import { AppError } from "../middleware/errorHandler";

@injectable()
export class MyOrderService {
  constructor(
    @inject(MyOrderRepository) private myOrderRepo: MyOrderRepository
  ) {}

  /**
   * Lấy orders của customer với details
   */
  async getMyOrders(customerId: number): Promise<MyOrder[]> {
    const orders = await this.myOrderRepo.getOrdersByCustomerId(customerId);

    if (orders.length === 0) {
      return [];
    }

    const orderIds = orders.map((o) => o.order_id);

    // Lấy order details
    const orderDetails = await this.myOrderRepo.getOrderDetailsByOrderIds(
      orderIds
    );

    // Lấy product items
    const productItemIds = orderDetails.map((od) => od.product_item_id);
    const productItemsMap =
      productItemIds.length > 0
        ? await this.myOrderRepo.getProductItemsWithProducts(productItemIds)
        : [];

    // Combine data
    return orders.map((order) => {
      const details = orderDetails.filter(
        (od) => od.order_id === order.order_id
      );
      const detailsWithProducts = details.map((detail) => {
        const productInfo = productItemsMap.find(
          (p) => p.product_item_id === detail.product_item_id
        );
        return {
          ...detail,
          product: productInfo || null,
        };
      });

      return {
        ...order,
        order_detail: details,
        infoProduct: detailsWithProducts,
      };
    });
  }
}

