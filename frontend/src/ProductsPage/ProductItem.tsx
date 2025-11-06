import {
  useLocation,
  useParams,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { type Products } from "../types/ProductTypes/ProductType";
import {
  Plus,
  Minus,
  Heart,
  Share2,
  ShoppingCart,
  Truck,
  Shield,
  RefreshCcw,
  X,
  ArrowLeft,
} from "lucide-react";
import { useEffect, useState } from "react";
import FullDescription from "../Components/FullDescription";
import Specification from "../Components/Specification";
import Review from "../Components/Review";
import { StarRating } from "../Components/RatingStar";
import { useAuth } from "../contexts/AuthContext";
const ProductItem = () => {
  const { user, token } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [countProduct, setCountProduct] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "description" | "specifications" | "review"
  >("description");
  const [productItems, setProductItems] = useState<any[]>([]);
  const [addingToCart, setAddingToCart] = useState(false);
  const [product, setProduct] = useState<Products | null>(
    (location.state as Products | undefined) ??
      (location.state as { product?: Products } | undefined)?.product ??
      null
  );

  const handleAddToCart = async () => {
    if (!user || !token) {
      alert("Vui lòng đăng nhập trước khi mua hàng");
      navigate("/login");
      return;
    }
    if (countProduct <= 0) {
      alert("Vui lòng chọn số lượng > 0");
      return;
    }
    if (!productItems || productItems.length === 0) {
      alert("Không có sản phẩm");
    }
    setAddingToCart(true);
    console.log(productItems[0]);
    const product_item_id = productItems[0].product_item_id;
    try {
      const res = await fetch(`${API_BASE}/api/orders/cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          product_item_id: product_item_id,
          quantity: countProduct,
        }),
      });
      if (!res.ok) {
        throw new Error("Không gửi được thông tin lên server");
      }
      alert("Đã thêm vào giỏ hàng");
      try {
        window.dispatchEvent(
          new CustomEvent("cart:add", { detail: { product_item_id } })
        );
      } catch (_) {}
      setCountProduct(0);
    } catch (error) {
      throw new Error("Lỗi server");
    } finally {
      setAddingToCart(false);
    }
  };
  const [loading, setLoading] = useState(!product);
  const API_BASE = import.meta.env.VITE_API_URL;
  const formatVND = (v: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(v);

  const handleBack = () => {
    navigate(-1);
  };

  useEffect(() => {
    const fetchDataAddInShop = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/api/products/${id}`);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data = await res.json();
        // xu li data ve form products
        if (!product) {
          const mappingProduct: Products = {
            id: data.product_id,
            title: data.product_name,
            price: data.price,
            description: data.description ?? "",
            category: data.category?.category_name ?? "",
            image: data.items?.[0]?.images?.[0]?.image_filename ?? "",
            inStockCount:
              data.items?.reduce(
                (sum: number, item: any) => sum + (item.quantity || 0),
                0
              ) ?? 0,
            isSale: false,
            rating: 0,
            countRating: 0,
            company: "",
            color: "",
          };
          setProduct(mappingProduct);
        }
        setProductItems(data.items || []);
      } catch (error) {
        throw new Error("Lỗi: Không thể tải được sản phẩm");
      } finally {
        setLoading(false);
      }
    };
    fetchDataAddInShop();
  }, [id]);

  if (loading) {
    return (
      <section className="py-6 md:py-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <p className="text-center text-gray-600">Đang tải sản phẩm...</p>
        </div>
      </section>
    );
  }

  if (!product) {
    return <Navigate to="/ProductsPage" replace />;
  }

  const handleIncreaseProduct = () => {
    const next = (prev: number) => Math.min(prev + 1, product.inStockCount);
    setCountProduct(next);
  };
  const handleDecreaseProduct = () => {
    const prev = (prev: number) => Math.max(prev - 1, 0);
    setCountProduct(prev);
  };
  return (
    <section className="py-6 md:py-8">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <button
          onClick={handleBack}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Quay lại</span>
        </button>

        <div className="grid grid-cols-2 space-x-6">
          <img
            src={product.image}
            alt=""
            className="rounded-lg w-full h-full object-cover cursor-pointer"
            onClick={() => setIsZoomed(true)}
          />
          {isZoomed && (
            <div
              className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
              onClick={() => setIsZoomed(false)}
            >
              <button
                className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
                onClick={() => setIsZoomed(false)}
              >
                <X size={32} />
              </button>
              <img
                src={product.image}
                alt={product.title}
                className="max-w-full max-h-full object-contain rounded-xl"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
          <div className="flex flex-col justify-start gap-6">
            <div className="flex flex-row gap-2">
              <h3 className="font-bold text-md text-black">
                {product.category}
              </h3>
              <h3 className="text-md text-gray-700"> {product.color}</h3>
            </div>
            <div className="text-4xl font-bold">{product.title}</div>
            <div className="flex flex-row items-center gap-3">
              <StarRating rating={product.rating} />
              <h3 className="font-bold text-md">{product.rating.toFixed(1)}</h3>
              <h3 className="text-md">({product.countRating})</h3>
            </div>
            <div className="flex flex-row justify-start gap-4 items-end">
              <h2 className="font-bold text-3xl">
                {product.isSale
                  ? formatVND(
                      product.price -
                        (product.price *
                          (product.percent ? product.percent : 0)) /
                          100
                    )
                  : formatVND(product.price)}
              </h2>
              <h3 className="text-2xl line-through">
                {product.isSale ? formatVND(product.price) : ""}
              </h3>
              <h3 className="text-lg font-bold">
                {product.isSale ? `Giảm ${product.percent}%` : ""}
              </h3>
            </div>
            <div>
              {product.inStockCount > 0 ? (
                <p className="font-sans text-green-600 text-lg">
                  Còn hàng ({product.inStockCount} sản phẩm)
                </p>
              ) : (
                <p className="font-sans text-red-600 text-lg">Hết hàng</p>
              )}
            </div>
            <p className="text-lg">{product.description}</p>
            <div className="flex flex-row gap-6 items-center">
              <p className="font-bold text-lg">Số lượng:</p>
              <div className="flex flex-row gap-6 items-center">
                <button
                  onClick={() => handleDecreaseProduct()}
                  className={`rounded-lg shadow-sm border p-2 ${
                    countProduct === 0
                      ? "cursor-not-allowed bg-gray-50"
                      : "cursor-pointer border-black/20 hover:shadow-md hover:scale-110 transition-all duration-300"
                  }`}
                  disabled={countProduct === 0}
                >
                  <Minus size={18} />
                </button>
                <p className="font-medium text-lg">{countProduct}</p>
                <button
                  onClick={() => handleIncreaseProduct()}
                  className={`rounded-lg shadow-sm border p-2 ${
                    countProduct === product.inStockCount
                      ? "cursor-not-allowed bg-gray-50"
                      : "cursor-pointer border-black/20 hover:shadow-md hover:scale-110 transition-all duration-300 "
                  }`}
                  disabled={countProduct === product.inStockCount}
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>
            <div className="flex flex-row gap-2">
              <div className="flex-1">
                <button
                  onClick={handleAddToCart}
                  className={`w-full inline-flex items-center justify-center gap-3 px-4 py-3 rounded-lg border border-black/20 bg-white ${
                    countProduct > 0
                      ? "bg-[linear-gradient(90deg,theme(colors.blue.500),theme(colors.blue.600))] bg-no-repeat bg-[length:0%_100%] hover:bg-[length:100%_100%] transition-[background-size] duration-300 ease-out text-black hover:text-white font-bold"
                      : "bg-[linear-gradient(90deg,theme(colors.gray.400),theme(colors.gray.500))] bg-no-repeat bg-[length:0%_100%] hover:bg-[length:100%_100%] transition-[background-size] duration-300 ease-out text-black hover:text-white font-bold cursor-not-allowed"
                  }`}
                >
                  <ShoppingCart size={22} />
                  <span>Thêm vào giỏ</span>
                </button>
              </div>
              <button className="rounded-lg shadow-sm border border-black/20 hover:shadow-md hover:scale-110 transition-all duration-300 p-2">
                <Heart />
              </button>
              <button className="rounded-lg shadow-sm border border-black/20 hover:shadow-md hover:scale-110 transition-all duration-300 p-2">
                <Share2 />
              </button>
            </div>
            <div className="flex flex-row justify-between gap-3 mt-8">
              <div className="flex flex-col items-center">
                <Truck size={28} />
                <p className="text-black font-bold text-lg text-center">
                  Miễn phí vận chuyển
                </p>
                <p className="text-gray-700 text-lg text-center">
                  Áp dụng cho đơn từ 1.000.000đ
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <Shield size={28} />
                <p className="text-black font-bold text-lg text-center">
                  Cam kết chính hãng
                </p>
                <p className="text-gray-700 text-lg">
                  Sản phẩm 100% chính hãng
                </p>
              </div>
              <div className="flex flex-col items-center">
                <RefreshCcw size={28} />
                <p className="text-black font-bold text-lg text-center">
                  Đổi trả 30 ngày
                </p>
                <p className="text-gray-700 text-lg text-center">
                  Chính sách đổi trả dễ dàng
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-28">
          <button
            onClick={() => setActiveTab("description")}
            className={`border shadow-sm rounded-lg p-1 transition-all ${
              activeTab === "description"
                ? "border-blue-500 bg-blue-50 font-bold"
                : "border-black/20 hover:border-blue-300"
            }`}
          >
            Mô tả chi tiết
          </button>
          <button
            onClick={() => setActiveTab("specifications")}
            className={`border shadow-sm rounded-lg p-1 transition-all ${
              activeTab === "specifications"
                ? "border-blue-500 bg-blue-50 font-bold"
                : "border-black/20 hover:border-blue-300"
            }`}
          >
            Thông số kỹ thuật
          </button>
          <button
            onClick={() => setActiveTab("review")}
            className={`border shadow-sm rounded-lg p-1 transition-all ${
              activeTab === "review"
                ? "border-blue-500 bg-blue-50 font-bold"
                : "border-black/20 hover:border-blue-300"
            }`}
          >
            Đánh giá ({product.countRating})
          </button>
        </div>
        <div className="mt-8 p-6 min-h-[200px]">
          {activeTab === "description" && <FullDescription product={product} />}
          {activeTab === "specifications" && (
            <Specification product={product} />
          )}
          {activeTab === "review" && <Review product={product} />}
        </div>
      </div>
    </section>
  );
};

export default ProductItem;
