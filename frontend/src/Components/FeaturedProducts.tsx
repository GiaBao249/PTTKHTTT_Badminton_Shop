import ProductCard from "./ProductCard";
import { Link } from "react-router-dom";
import type { ProductListItem } from "../types/ProductTypes/ProductType";
import { useState } from "react";
import { useEffect } from "react";
import { toUIProduct } from "../utils/productMapper";

const API_BASE = import.meta.env.VITE_API_URL;
const FeaturedProducts = () => {
  const [featuredProducts, setFeaturedProducts] = useState<ProductListItem[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
                <ProductCard product={toUIProduct(product)} variant="default" />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
