import { useEffect, useState, useMemo } from "react";
import ProductCard from "./ProductCard";
import { MoveRight } from "lucide-react";
import type { ProductListItem } from "../types/ProductTypes/ProductType";
import { toUIProduct } from "../utils/productMapper";
import { Link, useNavigate } from "react-router-dom";
import { cartService } from "../services/cartService";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";
const API_BASE = import.meta.env.VITE_API_URL;

type Description = {
  title: string;
  des: string;
  shop: string;
  categoryId: number;
};

type TopProductsResponse = {
  category_id: number;
  category_name: string;
  products: ProductListItem[];
};

const HotProducts = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [selectedDescription, setSelectedDescription] = useState<Description>({
    title: "Vợt cầu lông",
    des: "Khám phá bộ sưu tập vợt cao cấp, hiệu năng vượt trội cho nhà vô địch.",
    shop: "Cửa hàng vợt",
    categoryId: 1,
  });

  const [topProductsData, setTopProductsData] = useState<TopProductsResponse[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function handleDescriptionClick(description: Description) {
    setSelectedDescription(description);
  }

  useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${API_BASE}/api/products/top-by-categories`);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data: TopProductsResponse[] = await res.json();
        setTopProductsData(data);
      } catch (e: any) {
        setError(e.message || "Lỗi khi tải sản phẩm");
        console.error("Lỗi khi tải sản phẩm:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchTopProducts();
  }, []);

  const currentProducts = useMemo(() => {
    const categoryData = topProductsData.find(
      (item) => item.category_id === selectedDescription.categoryId
    );
    if (!categoryData) return [];
    return categoryData.products.map(toUIProduct);
  }, [topProductsData, selectedDescription.categoryId]);

  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Sản phẩm hot
          </h2>
          <p className="text-gray-600 text-normal text-xl text-center max-w-2xl mb-8">
            Sản phẩm thịnh hành mùa này
          </p>
        </div>
        <div className="flex flex-row items-center gap-4 justify-center mb-8 px-4">
          <button
            className="rounded-md font-medium text-black border border-black/20 w-[100px] h-[35px] text-sm"
            onClick={() =>
              handleDescriptionClick({
                title: "Vợt cầu lông",
                des: "Khám phá bộ sưu tập vợt cao cấp, hiệu năng vượt trội cho nhà vô địch.",
                shop: "Cửa hàng vợt",
                categoryId: 1,
              })
            }
          >
            Vợt
          </button>
          <button
            className="rounded-md font-medium text-black border border-black/20 w-[100px] h-[35px] text-sm"
            onClick={() =>
              handleDescriptionClick({
                title: "Giày cầu lông",
                des: "Khám phá bộ sưu tập giày cao cấp cho hiệu suất tối ưu.",
                shop: "Cửa hàng giày",
                categoryId: 2,
              })
            }
          >
            Giày
          </button>
          <button
            className="rounded-md font-medium text-black border border-black/20 w-[120px] h-[35px] text-sm"
            onClick={() =>
              handleDescriptionClick({
                title: "Quả cầu",
                des: "Bộ sưu tập cầu lông chất lượng cao, bay ổn định.",
                shop: "Cửa hàng cầu",
                categoryId: 5,
              })
            }
          >
            Quả cầu
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3 relative">
            <p className="font-medium text-md">DANH MỤC HOT TRONG TUẦN</p>
            <p className="font-bold text-4xl">{selectedDescription.title}</p>
            <p className="font-sans text-sm w-max-md w-[400px]">
              {selectedDescription.des}
            </p>
            <div className="absolute flex flex-row gap-4 bottom-10">
              <div className="flex flex-row gap-4 items-center text-sm font-medium text-black w-max px-4 py-2 cursor-pointer group">
                <p className="w-full text-sm">
                  Mua sắm {selectedDescription.title}
                </p>
                <div className="transition-all duration-300 group-hover:translate-x-1 group-hover:scale-120 group-hover:pl-2">
                  <MoveRight size={18} />
                </div>
              </div>
              <button className="text-[16px] font-medium border border-black/50 rounded-lg h-10 w-32">
                Xem ngay
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {loading ? (
              <div className="col-span-2 text-center py-8">
                <p className="text-gray-600">Đang tải sản phẩm...</p>
              </div>
            ) : error ? (
              <div className="col-span-2 text-center py-8">
                <p className="text-red-600">Lỗi: {error}</p>
              </div>
            ) : currentProducts.length === 0 ? (
              <div className="col-span-2 text-center py-8">
                <p className="text-gray-600">
                  Không có sản phẩm nào trong danh mục này
                </p>
              </div>
            ) : (
              currentProducts.slice(0, 4).map((product) => {
                return (
                  <Link
                    to={`/products-page/product/${product.id}`}
                    state={product}
                    key={product.id}
                  >
                    <ProductCard
                      product={product}
                      variant="minimal"
                      onAddToCart={async () => {
                        if (!token) {
                          toast.warning(
                            "Vui lòng đăng nhập trước khi mua hàng"
                          );
                          navigate("/login");
                          return;
                        }

                        try {
                          const res = await fetch(
                            `${API_BASE}/api/products/${product.id}`
                          );
                          if (!res.ok) {
                            throw new Error("Không thể lấy thông tin sản phẩm");
                          }
                          const data = await res.json();
                          if (!data.items || data.items.length === 0) {
                            toast.warning("Sản phẩm không có phiên bản nào");
                            return;
                          }

                          const product_item_id = data.items[0].product_item_id;
                          await cartService.addItem(product_item_id, 1, token);
                          toast.success("Đã thêm vào giỏ hàng");
                          window.dispatchEvent(new CustomEvent("cart:reload"));
                        } catch (error) {
                          toast.warning(
                            error instanceof Error
                              ? error.message
                              : "Lỗi khi thêm vào giỏ hàng"
                          );
                        }
                      }}
                    />
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HotProducts;
