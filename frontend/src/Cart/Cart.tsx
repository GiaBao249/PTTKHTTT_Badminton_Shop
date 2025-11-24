import ProductCard from "../Components/ProductCard";
import { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, Check, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { toUIProduct } from "../utils/productMapper";
import type { Products } from "../types/ProductTypes/ProductType";
import { cartService } from "../services/cartService";
import { toast } from "react-toastify";

type DataBaseResponseCartItem = {
  quantity: number;
  total_amount: number;
  product_item: {
    product_item_id: number;
    product_id: number;
    quantity: number;
    product: {
      product_id: number;
      product_name: string;
      price: number;
      category: {
        category_id: number;
        category_name: string;
      };
    };
  };
};
type CartItem = {
  product: Products;
  quantity: number;
  product_item_id: number;
  total_amount: number;
};

const Cart = () => {
  const [isHoveredLeft, setIsHoveredLeft] = useState(false);
  const [isHoveredRight, setIsHoveredRight] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectionProduct, setSelectionProduct] = useState<Set<number>>(
    new Set()
  );
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const fetchCartItems = async () => {
    if (!user || !token || user.role !== "user") {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data: DataBaseResponseCartItem[] = await cartService.getCartItems(
        user.id,
        token
      );
      const transformedData: CartItem[] = data.map((item) => {
        const productItems = {
          product_id: item.product_item.product.product_id,
          product_name: item.product_item.product.product_name,
          price: item.product_item.product.price,
          description: null,
          category: item.product_item.product.category || null,
          thumbnail: item.product_item.product.thumbnail || null,
        };
        return {
          product: {
            ...toUIProduct(productItems),
            inStockCount: item.product_item?.quantity || 0,
          },
          quantity: item.quantity,
          total_amount: item.total_amount,
          product_item_id: item.product_item.product_item_id,
        };
      });
      setCartItems(transformedData);
      setError(null);
      setSelectionProduct(
        new Set(transformedData.map((item) => item.product_item_id))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi khi tải giỏ hàng");
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchCartItems();
  }, [user, token]);
  const TotalMoney = cartItems
    .filter((item) => selectionProduct.has(item.product_item_id))
    .reduce((sum, item) => sum + item.total_amount, 0);
  const formatVND = (v: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(v);

  const selectedCartItems = cartItems.filter((item) =>
    selectionProduct.has(item.product_item_id)
  );

  const handleProceedToCheckout = () => {
    if (selectedCartItems.length === 0) {
      toast.warning("Vui lòng chọn ít nhất một sản phẩm để thanh toán");
      return;
    }
    navigate("/checkout", {
      state: {
        subtotal: TotalMoney,
        cartItems: selectedCartItems,
      },
    });
  };

  const handleToggleSelection = (ProductItemId: number) => {
    setSelectionProduct((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(ProductItemId)) {
        newSet.delete(ProductItemId);
      } else {
        newSet.add(ProductItemId);
      }
      return newSet;
    });
  };
  const handleSelectAllProduct = () => {
    if (selectionProduct.size === cartItems.length) {
      setSelectionProduct(new Set());
    } else {
      setSelectionProduct(
        new Set(cartItems.map((item) => item.product_item_id))
      );
    }
  };
  const handleIncreaseProductInShopCart = async (productItemId: number) => {
    if (!token || !user) {
      toast.warning("Vui lòng đăng nhập");
      return;
    }
    const item = cartItems.find((i) => i.product_item_id === productItemId);
    if (!item || item.quantity >= item.product.inStockCount) {
      if (item && item.quantity >= item.product.inStockCount) {
        toast.warning("Đã đạt số lượng tối đa trong kho");
      }
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.product_item_id === productItemId
          ? {
              ...item,
              quantity: item.quantity + 1,
              total_amount:
                (item.total_amount / item.quantity) * (item.quantity + 1),
            }
          : item
      )
    );
    try {
      await cartService.updateQuantity(
        productItemId,
        item.quantity + 1,
        token,
        user.id
      );
      toast.success("Đã cập nhật số lượng");
    } catch (error) {
      setCartItems((prev) =>
        prev.map((item) =>
          item.product_item_id === productItemId
            ? {
                ...item,
                quantity: item.quantity,
                total_amount: item.total_amount,
              }
            : item
        )
      );
      toast.error("Không thể cập nhật số lượng");
    }
  };
  const handleDecreaseProductInShopCart = async (productItemId: number) => {
    if (!token || !user) {
      toast.warning("Vui lòng đăng nhập");
      return;
    }
    const item = cartItems.find((i) => i.product_item_id === productItemId);
    if (!item || item.quantity <= 1) return;
    setCartItems((prev) =>
      prev.map((item) =>
        item.product_item_id === productItemId
          ? {
              ...item,
              quantity: item.quantity - 1,
              total_amount:
                (item.total_amount / item.quantity) * (item.quantity - 1),
            }
          : item
      )
    );
    try {
      if (!token || !user) {
        return;
      }

      await cartService.updateQuantity(
        productItemId,
        item.quantity - 1,
        token,
        user.id
      );
      toast.success("Đã cập nhật số lượng");
    } catch (error) {
      setCartItems((prev) =>
        prev.map((item) =>
          item.product_item_id === productItemId
            ? {
                ...item,
                quantity: item.quantity,
                total_amount: item.total_amount,
              }
            : item
        )
      );
      toast.error("Không thể cập nhật số lượng. Vui lòng thử lại.");
    }
  };
  const handleUpdateQuantityInCart = async (
    productItemId: number,
    newQuantity: number
  ) => {
    if (!token || !user) {
      toast.warning("Vui lòng đăng nhập");
      return;
    }
    const item = cartItems.find((i) => i.product_item_id === productItemId);
    if (!item) return;

    if (newQuantity < 1) {
      toast.warning("Số lượng tối thiểu là 1");
      return;
    }
    if (newQuantity > item.product.inStockCount) {
      toast.warning(`Chỉ còn ${item.product.inStockCount} sản phẩm trong kho`);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.product_item_id === productItemId
          ? {
              ...item,
              quantity: newQuantity,
              total_amount: item.product.price * newQuantity,
            }
          : item
      )
    );

    try {
      await cartService.updateQuantity(
        productItemId,
        newQuantity,
        token,
        user.id
      );
      toast.success("Đã cập nhật số lượng");
      window.dispatchEvent(new CustomEvent("cart:reload"));
    } catch (error) {
      fetchCartItems();
      toast.error("Không thể cập nhật số lượng");
    }
  };

  const handleDeleteProductInShopCart = async (productItemId: number) => {
    if (!token) return;
    setCartItems((prev) =>
      prev.filter((item) => item.product_item_id !== productItemId)
    );
    setSelectionProduct((prev) => {
      const newSet = new Set(prev);
      newSet.delete(productItemId);
      return newSet;
    });

    try {
      await cartService.removeItem(productItemId, token);
      toast.success("Đã xóa sản phẩm khỏi giỏ hàng");
      try {
        window.dispatchEvent(
          new CustomEvent("cart:remove", {
            detail: { product_item_id: productItemId },
          })
        );
      } catch (_) {}
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Lỗi khi xóa sản phẩm"
      );
      fetchCartItems();
    }
  };
  if (loading) {
    return (
      <section className="py-6 md:py-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <h1 className="text-3xl font-bold">Giỏ hàng</h1>
          <div className="flex justify-center items-center py-20">
            <p className="text-lg text-gray-500">Đang tải giỏ hàng...</p>
          </div>
        </div>
      </section>
    );
  }
  if (!user || user.role !== "user") {
    return (
      <section className="py-6 md:py-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <h1 className="text-3xl font-bold">Giỏ hàng</h1>
          <div className="flex justify-center items-center py-20">
            <p className="text-lg text-gray-500">
              Vui lòng đăng nhập để xem giỏ hàng
            </p>
          </div>
        </div>
      </section>
    );
  }
  if (error) {
    return (
      <section className="py-6 md:py-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <h1 className="text-3xl font-bold">Giỏ hàng</h1>
          <div className="flex justify-center items-center py-20">
            <p className="text-lg text-red-500">{error}</p>
          </div>
        </div>
      </section>
    );
  }
  return (
    <section className="py-6 md:py-8">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <h1 className="text-3xl font-bold">Giỏ hàng</h1>
        <div className="grid gird-cols-1 lg:grid-cols-[70%_30%] gap-10 mt-10">
          <div className="flex flex-col gap-4">
            {cartItems.length > 0 && (
              <div className="flex items-center justify-between mb-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={
                      selectionProduct.size === cartItems.length &&
                      cartItems.length > 0
                    }
                    onChange={handleSelectAllProduct}
                    className="w-5 h-5 cursor-pointer rounded border-gray-300 text-green-600 focus:ring-green-500 focus:ring-2"
                  />
                  <label className="cursor-pointer font-semibold text-gray-800 hover:text-green-600 transition-colors">
                    Chọn tất cả
                  </label>
                </div>
                <span className="text-sm text-gray-600">
                  Đã chọn: {selectionProduct.size} / {cartItems.length}
                </span>
              </div>
            )}
            {cartItems.length === 0 ? (
              <div className="flex justify-center items-center py-20">
                <div className="flex flex-col gap-4 items-center">
                  <ShoppingBag size={96} strokeWidth={1} />
                  <p className="text-lg text-gray-500">
                    Giỏ hàng của bạn đang trống
                  </p>
                </div>
              </div>
            ) : (
              cartItems.map((data) => (
                <div
                  key={data.product_item_id}
                  className={`flex flex-row gap-4 p-4 rounded-lg border transition-all duration-200 items-center ${
                    selectionProduct.has(data.product_item_id)
                      ? "border-green-500 bg-green-50 shadow-md"
                      : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded border-2 cursor-pointer transition-all flex items-center justify-center ${
                      selectionProduct.has(data.product_item_id)
                        ? "bg-green-600 border-green-600"
                        : "bg-white border-gray-300 hover:border-green-500 "
                    }`}
                    onClick={() => handleToggleSelection(data.product_item_id)}
                  >
                    {selectionProduct.has(data.product_item_id) && (
                      <Check
                        size={16}
                        className="text-white"
                        strokeWidth={3.6}
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <ProductCard
                      product_item_id={data.product_item_id}
                      variant="cart"
                      product={data.product}
                      quantity={data.quantity}
                      onIncrease={() =>
                        handleIncreaseProductInShopCart(data.product_item_id)
                      }
                      onDecrease={() =>
                        handleDecreaseProductInShopCart(data.product_item_id)
                      }
                      onUpdateQuantity={(newQuantity) =>
                        handleUpdateQuantityInCart(
                          data.product_item_id,
                          newQuantity
                        )
                      }
                      onRemove={() =>
                        handleDeleteProductInShopCart(data.product_item_id)
                      }
                    />
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="ml-10 mt-4 space-y-4">
            <h1 className="font-bold truncate text-xl">Tóm tắt đơn hàng</h1>
            <div className="border-b-2 pb-8">
              <p className="text-md font-medium">Mã khuyến mãi</p>
              <div className="flex flex-row items-center gap-3">
                <input
                  type="text"
                  placeholder="Nhập mã giảm giá"
                  className="flex flex-1 border border-gray-200 rounded-lg"
                />
                <button className="rounded-lg border border-gray-200 py-2 w-full">
                  Áp dụng
                </button>
              </div>
            </div>
            <div className="border-b-2 pb-8 space-y-2">
              <div className="flex flex-row justify-between items-center">
                <p className="text-md font-normal">Tạm tính</p>
                <p className="font-bold text-md">{formatVND(TotalMoney)}</p>
              </div>
              <div className="flex flex-row justify-between items-center">
                {/* <p className="text-md font-normal">Shipping</p> */}
                {/* <p className="text-md font-bold">Free</p> */}
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <button
                onMouseEnter={() => setIsHoveredRight(true)}
                onMouseLeave={() => setIsHoveredRight(false)}
                onClick={handleProceedToCheckout}
                className="rounded-xl p-2 border border-gray-200 items-center bg-[linear-gradient(90deg,theme(colors.green.500),theme(colors.green.600))] bg-no-repeat bg-[length:0%_100%] hover:bg-[length:100%_100%] transition-[background-size] duration-300 ease-out text-black hover:text-white font-bold relative"
              >
                <span className="items-center">Tiến hành thanh toán</span>
                <ArrowRight
                  size={20}
                  className={`absolute right-6 bottom-1/4 inline-flex items-end transition-opacity ${
                    isHoveredRight ? "duration-300" : "duration-50"
                  } transform ${
                    isHoveredRight
                      ? "opacity-100 translate-x-2"
                      : "opacity-0 translate-x-0"
                  }`}
                />
              </button>
              <button
                onMouseEnter={() => setIsHoveredLeft(true)}
                onMouseLeave={() => setIsHoveredLeft(false)}
                onClick={() => navigate("/products-page?category=all")}
                className="rounded-xl p-2 border border-gray-200 items-center bg-[linear-gradient(0deg,theme(colors.blue.600),theme(colors.blue.500))] bg-no-repeat bg-[length:0%_100%] hover:bg-[length:100%_100%] transition-[background-size] duration-300 ease-out text-black hover:text-white font-bold bg-right relative"
              >
                <ArrowLeft
                  size={20}
                  className={`absolute left-2 bottom-1/4 inline-flex transition-opacity ${
                    isHoveredLeft ? "duration-300" : "duration-200"
                  } transform ${
                    isHoveredLeft
                      ? "opacity-100 translate-x-2"
                      : "opacity-0 translate-x-0"
                  }`}
                />
                <span className="items-center">Tiếp tục mua sắm</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Cart;
