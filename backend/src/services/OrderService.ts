import { inject, injectable } from "tsyringe";
import { OrderRepository } from "../repositories/OrderRepository";
import { Order, OrderDetail, UpdateOrderStatusDto } from "../models/Order";
import { AppError } from "../middleware/errorHandler";
@injectable()
export class OrderService {
  constructor(@inject(OrderRepository) private orderRepo: OrderRepository) {}
  async getRecentOrders(limit: number = 5): Promise<Order[]> {
    return await this.orderRepo.findRecent(limit);
  }
  async getAllOrders(): Promise<Order[]> {
    return await this.orderRepo.findAll();
  }

  /**
   * Lấy order theo ID
   */
  async getOrderById(orderId: number): Promise<Order> {
    const order = await this.orderRepo.findById(orderId);
    if (!order) {
      throw new AppError(404, "Không tìm thấy đơn hàng", "ORDER_NOT_FOUND");
    }
    return order;
  }

  /**
   * Lấy order details theo order ID
   */
  async getOrderDetailsByOrderId(orderId: number): Promise<OrderDetail[]> {
    // Validate orderId
    if (!orderId || isNaN(Number(orderId))) {
      throw new AppError(
        400,
        "Thiếu orderId hoặc sai định dạng",
        "VALIDATION_ERROR"
      );
    }

    return await this.orderRepo.getOrderDetailsByOrderId(Number(orderId));
  }

  /**
   * Cập nhật order status với logic trả lại số lượng khi hủy
   */
  async updateOrderStatus(updateDto: UpdateOrderStatusDto): Promise<{
    order: Order;
    message: string;
  }> {
    // Validation
    if (!updateDto.order_id) {
      throw new AppError(400, "Thiếu order_id", "VALIDATION_ERROR");
    }

    if (!updateDto.status) {
      throw new AppError(400, "Thiếu status", "VALIDATION_ERROR");
    }

    // Lấy order status hiện tại
    const oldStatus = await this.orderRepo.getOrderStatus(updateDto.order_id);
    if (!oldStatus) {
      throw new AppError(404, "Không tìm thấy đơn hàng", "ORDER_NOT_FOUND");
    }

    const isCancelling =
      updateDto.status === "Cancelled" && oldStatus !== "Cancelled";

    // Nếu đang hủy đơn, trả lại số lượng sản phẩm vào kho
    if (isCancelling) {
      await this.restoreProductQuantities(updateDto.order_id);
    }

    // Cập nhật status
    const updatedOrder = await this.orderRepo.updateStatus(
      updateDto.order_id,
      updateDto.status
    );

    return {
      order: updatedOrder,
      message: isCancelling
        ? "Hủy đơn hàng thành công và đã trả lại số lượng sản phẩm vào kho"
        : "Cập nhật trạng thái thành công",
    };
  }

  /**
   * Trả lại số lượng sản phẩm vào kho khi hủy đơn
   */
  private async restoreProductQuantities(orderId: number): Promise<void> {
    const orderDetails = await this.orderRepo.getOrderDetailsByOrderId(orderId);

    if (orderDetails.length === 0) {
      return;
    }

    // Xử lý từng product item
    for (const detail of orderDetails) {
      try {
        const currentQuantity = await this.orderRepo.getProductItemQuantity(
          detail.product_item_id
        );

        if (currentQuantity === null) {
          console.warn(`Product item ${detail.product_item_id} không tồn tại`);
          continue;
        }

        const newQuantity = currentQuantity + detail.quantity;
        await this.orderRepo.updateProductItemQuantity(
          detail.product_item_id,
          newQuantity
        );

        console.log(
          `Trả lại ${detail.quantity} sản phẩm cho product_item ${detail.product_item_id}`
        );
      } catch (error) {
        console.error(
          `Error restoring quantity for product_item ${detail.product_item_id}:`,
          error
        );
      }
    }
  }
}
