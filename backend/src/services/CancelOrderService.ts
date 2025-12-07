import { injectable, inject } from "tsyringe";
import { CancelOrderRepository } from "../repositories/CancelOrderRepository";
import { AppError } from "../middleware/errorHandler";

@injectable()
export class CancelOrderService {
  constructor(
    @inject(CancelOrderRepository)
    private cancelOrderRepo: CancelOrderRepository
  ) {}

  /**
   * Hủy đơn hàng
   */
  async cancelOrder(orderId: number, customerId: number): Promise<{
    success: boolean;
    message: string;
    order: any;
  }> {
    // Kiểm tra order
    const order = await this.cancelOrderRepo.getOrderById(orderId);
    if (!order) {
      throw new AppError(404, "Không tìm thấy đơn hàng", "ORDER_NOT_FOUND");
    }

    // Kiểm tra quyền
    if (order.customer_id !== customerId) {
      throw new AppError(
        403,
        "Bạn không có quyền hủy đơn hàng này",
        "FORBIDDEN"
      );
    }

    // Kiểm tra status
    if (order.status !== "Pending" && order.status !== "Processing") {
      throw new AppError(
        400,
        `Không thể hủy đơn hàng với trạng thái hiện tại: ${order.status}. Chỉ có thể hủy đơn hàng đang "Chờ xử lý"`,
        "INVALID_STATUS"
      );
    }

    // Lấy order details
    const orderDetails = await this.cancelOrderRepo.getOrderDetails(orderId);

    // Trả lại số lượng sản phẩm vào kho
    if (orderDetails.length > 0) {
      for (const detail of orderDetails) {
        try {
          const currentQuantity =
            await this.cancelOrderRepo.getProductItemQuantity(
              detail.product_item_id
            );

          if (currentQuantity === null) {
            console.warn(
              `Product item ${detail.product_item_id} không tồn tại`
            );
            continue;
          }

          const newQuantity = currentQuantity + detail.quantity;
          await this.cancelOrderRepo.updateProductItemQuantity(
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

    // Cập nhật order status
    const updatedOrder = await this.cancelOrderRepo.updateOrderStatus(
      orderId,
      "Cancelled"
    );

    return {
      success: true,
      message:
        "Hủy đơn hàng thành công và đã trả lại số lượng sản phẩm vào kho",
      order: updatedOrder,
    };
  }
}

