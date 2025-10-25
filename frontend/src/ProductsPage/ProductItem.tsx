import { useLocation, useParams, Navigate } from "react-router-dom";
import type { Products } from "../types/ProductTypes/ProductType";
import {
  Star,
  Plus,
  Minus,
  Heart,
  Share2,
  ShoppingCart,
  Truck,
  Shield,
  RefreshCcw,
  X,
} from "lucide-react";
import { useState } from "react";
import FullDescription from "../Components/FullDescription";
import Specification from "../Components/Specification";
import Review from "../Components/Review";
import { StarRating } from "../Components/RatingStar";
const ProductItem = () => {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const [countProduct, setCountProduct] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "description" | "specifications" | "review"
  >("description");
  const product =
    (location.state as Products | undefined) ??
    (location.state as { product?: Products } | undefined)?.product;

  if (!product) {
    // TODO: fetch theo slug nếu có dữ liệu/ API
    return <Navigate to="/ProductsPage" replace />;
  }

  const handleIncreaseProduct = () => {
    const next = (prev: number) => Math.min(prev + 1, product.inStockCount);
    setCountProduct(next);
  };
  const handleDescreaseProduct = () => {
    const prev = (prev: number) => Math.max(prev - 1, 0);
    setCountProduct(prev);
  };

  return (
    <section className="py-6 md:py-8">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
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
                {product.company}
              </h3>
              <p> • </p>
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
                $
                {product.isSale
                  ? (
                      product.price -
                      (product.price *
                        (product.percent ? product.percent : 0)) /
                        100
                    ).toFixed(2)
                  : product.price.toFixed(2)}
              </h2>
              <h3 className="text-2xl line-through">
                {product.isSale ? `$${product.price}` : ""}
              </h3>
              <h3 className="text-lg font-bold">
                {product.isSale ? `Save ${product.percent}%` : ""}
              </h3>
            </div>
            <div>
              {product.inStockCount > 0 ? (
                <p className="font-sans text-green-600 text-lg">
                  In Stock ({product.inStockCount} available)
                </p>
              ) : (
                <p className="font-sans text-red-600 text-lg">Out of Stock</p>
              )}
            </div>
            <p className="text-lg">{product.description}</p>
            <div className="flex flex-row gap-6 items-center">
              <p className="font-bold text-lg">Quantity:</p>
              <div className="flex flex-row gap-6 items-center">
                <button
                  onClick={() => handleDescreaseProduct()}
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
                  className={`w-full inline-flex items-center justify-center gap-3 px-4 py-3 rounded-lg border border-black/20 bg-white ${
                    countProduct > 0
                      ? "bg-[linear-gradient(90deg,theme(colors.blue.500),theme(colors.blue.600))] bg-no-repeat bg-[length:0%_100%] hover:bg-[length:100%_100%] transition-[background-size] duration-300 ease-out text-black hover:text-white font-bold"
                      : "bg-[linear-gradient(90deg,theme(colors.gray.400),theme(colors.gray.500))] bg-no-repeat bg-[length:0%_100%] hover:bg-[length:100%_100%] transition-[background-size] duration-300 ease-out text-black hover:text-white font-bold cursor-not-allowed"
                  }`}
                >
                  <ShoppingCart size={22} />
                  <span>Add To Cart</span>
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
                <p className="text-black font-bold text-lg">Free Shipping</p>
                <p className="text-gray-700 text-lg">On orders over 0.5$</p>
              </div>
              <div className="flex flex-col items-center">
                <Shield size={28} />
                <p className="text-black font-bold text-lg">
                  Authentic Guarantee
                </p>
                <p className="text-gray-700 text-lg">100% genuine products</p>
              </div>
              <div className="flex flex-col items-center">
                <RefreshCcw size={28} />
                <p className="text-black font-bold text-lg">30-Day Returns</p>
                <p className="text-gray-700 text-lg">Easy return policy</p>
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
            Full Description
          </button>
          <button
            onClick={() => setActiveTab("specifications")}
            className={`border shadow-sm rounded-lg p-1 transition-all ${
              activeTab === "specifications"
                ? "border-blue-500 bg-blue-50 font-bold"
                : "border-black/20 hover:border-blue-300"
            }`}
          >
            Specifications
          </button>
          <button
            onClick={() => setActiveTab("review")}
            className={`border shadow-sm rounded-lg p-1 transition-all ${
              activeTab === "review"
                ? "border-blue-500 bg-blue-50 font-bold"
                : "border-black/20 hover:border-blue-300"
            }`}
          >
            Review ({product.countRating})
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
