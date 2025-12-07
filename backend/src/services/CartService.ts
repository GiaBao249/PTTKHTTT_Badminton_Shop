import { injectable, inject } from "tsyringe";
import { CartRepository } from "../repositories/CartRepository";
import {
  CartItem,
  AddToCartDto,
  UpdateCartDto,
  DeleteCartItemDto,
  CartResponse,
} from "../models/Cart";
import { AppError } from "../middleware/errorHandler";

@injectable()
export class CartService {
  constructor(@inject(CartRepository) private cartRepo: CartRepository) {}

  /**
   * Lấy cart items của customer
   */
  async getCartItems(customerId: number): Promise<CartItem[]> {
    let cartId = await this.cartRepo.getCartIdByCustomerId(customerId);

    if (!cartId) {
      return [];
    }

    const cartItems = await this.cartRepo.getCartItems(cartId);

    // Lấy thumbnails
    const productIds = cartItems
      .map((item) => item.product_item?.product?.product_id)
      .filter(Boolean) as number[];

    if (productIds.length > 0) {
      const thumbnailMap = await this.cartRepo.getProductItemsWithImages(
        productIds
      );

      // Thêm thumbnail vào mỗi item
      return cartItems.map((item) => {
        const productId = item.product_item?.product?.product_id;
        if (productId && item.product_item?.product) {
          item.product_item.product.thumbnail =
            thumbnailMap.get(productId) ?? null;
        }
        return item;
      });
    }

    return cartItems;
  }

  /**
   * Thêm item vào cart
   */
  async addToCart(
    customerId: number,
    addDto: AddToCartDto
  ): Promise<CartResponse> {
    const { product_item_id, quantity } = addDto;

    // Validation
    if (!product_item_id || !quantity) {
      throw new AppError(400, "Thiếu thông tin", "VALIDATION_ERROR");
    }

    if (typeof quantity !== "number" || quantity <= 0 || !Number.isInteger(quantity)) {
      throw new AppError(
        400,
        "Số lượng phải là số nguyên dương",
        "VALIDATION_ERROR"
      );
    }

    // Lấy hoặc tạo cart
    let cartId = await this.cartRepo.getCartIdByCustomerId(customerId);
    if (!cartId) {
      cartId = await this.cartRepo.createCart(customerId);
    }

    // Kiểm tra product item
    const productItem = await this.cartRepo.getProductItemById(product_item_id);
    if (!productItem) {
      throw new AppError(404, "Không tìm thấy sản phẩm", "PRODUCT_NOT_FOUND");
    }

    if (!productItem.quantity || productItem.quantity <= 0) {
      throw new AppError(400, "Sản phẩm đã hết hàng", "OUT_OF_STOCK");
    }

    // Lấy giá sản phẩm
    const price = await this.cartRepo.getProductPrice(productItem.product_id);
    if (!price) {
      throw new AppError(
        404,
        "Không tìm thấy thông tin sản phẩm",
        "PRODUCT_NOT_FOUND"
      );
    }

    // Kiểm tra item đã có trong cart chưa
    const existingItem = await this.cartRepo.getExistingCartItem(
      cartId,
      product_item_id
    );

    const totalQuantity = existingItem
      ? existingItem.quantity + quantity
      : quantity;

    if (totalQuantity > productItem.quantity) {
      throw new AppError(
        400,
        `Chỉ còn ${productItem.quantity} sản phẩm trong kho`,
        "INSUFFICIENT_QUANTITY"
      );
    }

    if (existingItem) {
      // Cập nhật quantity
      const newQuantity = existingItem.quantity + quantity;
      const data = await this.cartRepo.updateCartItem(
        cartId,
        product_item_id,
        newQuantity,
        price * newQuantity
      );

      return {
        success: true,
        data,
        message: "Đã cập nhật giỏ hàng",
      };
    } else {
      // Thêm mới
      const data = await this.cartRepo.addCartItem(
        cartId,
        product_item_id,
        quantity,
        price * quantity
      );

      return {
        success: true,
        data,
        message: "Đã thêm vào giỏ hàng",
      };
    }
  }

  /**
   * Cập nhật cart item
   */
  async updateCartItem(
    customerId: number,
    updateDto: UpdateCartDto
  ): Promise<CartResponse> {
    const { product_item_id, quantity } = updateDto;

    if (!product_item_id || quantity === undefined) {
      throw new AppError(400, "Thiếu thông tin", "VALIDATION_ERROR");
    }

    if (typeof quantity !== "number" || quantity < 0 || !Number.isInteger(quantity)) {
      throw new AppError(
        400,
        "Số lượng phải là số nguyên không âm",
        "VALIDATION_ERROR"
      );
    }

    const cartId = await this.cartRepo.getCartIdByCustomerId(customerId);
    if (!cartId) {
      throw new AppError(404, "Không tìm thấy giỏ hàng", "CART_NOT_FOUND");
    }

    // Kiểm tra product item
    const productItem = await this.cartRepo.getProductItemById(product_item_id);
    if (!productItem) {
      throw new AppError(404, "Không tìm thấy sản phẩm", "PRODUCT_NOT_FOUND");
    }

    if (quantity > productItem.quantity) {
      throw new AppError(
        400,
        `Chỉ còn ${productItem.quantity} sản phẩm trong kho`,
        "INSUFFICIENT_QUANTITY"
      );
    }

    // Lấy giá
    const price = await this.cartRepo.getProductPrice(productItem.product_id);
    if (!price) {
      throw new AppError(
        404,
        "Không tìm thấy thông tin sản phẩm",
        "PRODUCT_NOT_FOUND"
      );
    }

    const totalAmount = price * quantity;
    const data = await this.cartRepo.updateCartItem(
      cartId,
      product_item_id,
      quantity,
      totalAmount
    );

    return {
      success: true,
      data,
    };
  }

  /**
   * Xóa cart item
   */
  async deleteCartItem(
    customerId: number,
    deleteDto: DeleteCartItemDto
  ): Promise<CartResponse> {
    const { product_item_id } = deleteDto;

    if (!product_item_id) {
      throw new AppError(400, "Thiếu product_item_id", "VALIDATION_ERROR");
    }

    const cartId = await this.cartRepo.getCartIdByCustomerId(customerId);
    if (!cartId) {
      throw new AppError(404, "Không tìm thấy giỏ hàng", "CART_NOT_FOUND");
    }

    await this.cartRepo.deleteCartItem(cartId, product_item_id);

    return {
      success: true,
    };
  }
}

