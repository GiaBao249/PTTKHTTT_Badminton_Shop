import ProductCard from "./ProductCard";
import { Link, useNavigate } from "react-router-dom";
import type { ProductListItem } from "../types/ProductTypes/ProductType";
import { useState } from "react";
import { useEffect } from "react";
import { toUIProduct } from "../utils/productMapper";
import { useAuth } from "../contexts/AuthContext";
import { cartService } from "../services/cartService";
const API_BASE = import.meta.env.VITE_API_URL;
const FeaturedProducts = () => {
  const [featuredProducts, setFeaturedProducts] = useState<ProductListItem[]>(
    []
  );
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${API_BASE}/api/products/featured-products`);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data: ProductListItem[] = await res.json();
        setFeaturedProducts(data);
      } catch (e: any) {
        setError(e.message || "Lỗi khi tải sản phẩm");
        console.error("Lỗi khi tải sản phẩm:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-row justify-between">
          <div>
            <h2 className="font-bold text-4xl text-gray-900">
              Sản phẩm nổi bật
            </h2>
            <p className="font-light text-lg md:text-xl text-gray-600 pt-3">
              Lựa chọn hàng đầu cho người chơi nghiêm túc
            </p>
          </div>
          <Link to="/products-page">
            <button className="mt-5 shadow-sm rounded-lg h-10 border border-black/20 px-4 hover:shadow-md hover:scale-105 transition-all duration-300">
              Xem tất cả
            </button>
          </Link>
        </div>
        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 xl:gap-7 mt-8 rounded-lg">
          {featuredProducts.map((product: ProductListItem) => {
            return (
              <Link
                to={`/products-page/product/${product.product_id}`}
                state={toUIProduct(product)}
                key={product.product_id}
              >
                <ProductCard
                  product={toUIProduct(product)}
                  variant="default"
                  onAddToCart={async () => {
                    if (!token) {
                      alert("Vui lòng đăng nhập trước khi mua hàng");
                      navigate("/login");
                      return;
                    }

                    try {
                      const res = await fetch(
                        `${API_BASE}/api/products/${product.product_id}`
                      );
                      if (!res.ok) {
                        throw new Error("Không thể lấy thông tin sản phẩm");
                      }
                      const data = await res.json();
                      if (!data.items || data.items.length === 0) {
                        alert("Sản phẩm không có phiên bản nào");
                        return;
                      }
                      const product_item_id = data.items[0].product_item_id;
                      await cartService.addItem(product_item_id, 1, token);
                      alert("Đã thêm vào giỏ hàng");
                    } catch (error) {
                      alert(
                        error instanceof Error
                          ? error.message
                          : "Lỗi khi thêm vào giỏ hàng"
                      );
                    }
                  }}
                />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
