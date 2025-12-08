import { injectable, inject } from "tsyringe";
import { CheckoutRepository } from "../repositories/CheckoutRepository";
import { CheckoutDto, CheckoutResponse } from "../models/Checkout";
import { AppError } from "../middleware/errorHandler";

@injectable()
export class CheckoutService {
  constructor(
    @inject(CheckoutRepository) private checkoutRepo: CheckoutRepository
  ) {}

  /**
   * Xử lý checkout
   */
  async checkout(
    customerId: number,
    checkoutDto: CheckoutDto
  ): Promise<CheckoutResponse> {
    const {
      cart_items,
      address_id,
      shipping_info,
      payment_method,
      total_amount,
    } = checkoutDto;

    // Validation
    if (!cart_items || cart_items.length === 0) {
      throw new AppError(400, "Giỏ hàng trống", "VALIDATION_ERROR");
    }

    // Kiểm tra số lượng sản phẩm
    const productItemIds = cart_items.map((item) => item.product_item_id);
    const productItems = await this.checkoutRepo.getProductItemsByIds(
      productItemIds
    );

    for (const item of cart_items) {
      const productItem = productItems.find(
        (p) => p.product_item_id === item.product_item_id
      );
      if (!productItem || productItem.quantity < item.quantity) {
        throw new AppError(
          400,
          `Sản phẩm #${item.product_item_id} không đủ số lượng`,
          "INSUFFICIENT_QUANTITY"
        );
      }
    }

    // Xử lý địa chỉ
    let finalAddressId = address_id;
    if (!finalAddressId && !shipping_info) {
      throw new AppError(400, "Thiếu thông tin địa chỉ", "VALIDATION_ERROR");
    }

    if (!finalAddressId && shipping_info) {
      const { address, district, city } = shipping_info;
      if (!address || !district || !city) {
        throw new AppError(
          400,
          "Thiếu thông tin địa chỉ giao hàng",
          "VALIDATION_ERROR"
        );
      }
      finalAddressId = await this.checkoutRepo.createAddress(
        customerId,
        shipping_info
      );
    }

    // Tạo order
    if (!finalAddressId) {
      throw new AppError(
        400,
        "Địa chỉ giao hàng là bắt buộc",
        "VALIDATION_ERROR"
      );
    }
    const orderId = await this.checkoutRepo.createOrder(
      customerId,
      finalAddressId,
      total_amount
    );

    // Tạo order details
    await this.checkoutRepo.createOrderDetails(orderId, cart_items);

    // Xử lý theo payment method
    if (payment_method === "cod" || payment_method === "card") {
      // COD hoặc Card: Trừ inventory ngay và xóa cart
      await this.processInventoryAndCart(customerId, cart_items, productItems);
      return {
        success: true,
        order_id: orderId,
        message: "Đặt hàng thành công",
        payment_method: payment_method,
      };
    } else if (payment_method === "vnpay") {
      // VNPay: Chưa trừ inventory, trả về để redirect
      return {
        success: true,
        order_id: orderId,
        message: "Đang chuyển hướng đến trang thanh toán VNPay",
        payment_method: "vnpay",
        requires_payment: true,
      };
    } else if (payment_method === "vietqr") {
      // VietQR: Chưa trừ inventory, trả về để hiển thị QR
      return {
        success: true,
        order_id: orderId,
        message: "Vui lòng quét mã QR để thanh toán",
        payment_method: "vietqr",
        requires_payment: true,
      };
    } else {
      throw new AppError(
        400,
        "Phương thức thanh toán không hợp lệ",
        "VALIDATION_ERROR"
      );
    }
  }

  /**
   * Trừ inventory và xóa cart items
   */
  private async processInventoryAndCart(
    customerId: number,
    cartItems: any[],
    productItems: Array<{ product_item_id: number; quantity: number }>
  ): Promise<void> {
    // Trừ inventory
    for (const item of cartItems) {
      const productItem = productItems.find(
        (p) => p.product_item_id === item.product_item_id
      );
      if (productItem) {
        await this.checkoutRepo.updateProductItemQuantity(
          item.product_item_id,
          productItem.quantity - item.quantity
        );
      }
    }

    // Xóa cart items
    const cartId = await this.checkoutRepo.getCartByCustomerId(customerId);
    if (cartId) {
      const checkedOutProductIds = cartItems.map(
        (item) => item.product_item_id
      );
      await this.checkoutRepo.deleteCartItems(cartId, checkedOutProductIds);
    }
  }
}
