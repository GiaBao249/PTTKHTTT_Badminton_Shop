import { ShoppingCart, Star, Trash2, Plus, Minus } from "lucide-react";
import type {
  Products,
  ProductCardVariant,
} from "../types/ProductTypes/ProductType";
type ProductCardProps = {
  product: Products;
  variant?: ProductCardVariant;
  quantity?: number;
  onIncrease?: () => void;
  onDecrease?: () => void;
  onRemove?: () => void;
};
const ProductCard = ({
  product,
  variant = "default",
  quantity = 1,
  onIncrease,
  onDecrease,
  onRemove,
}: ProductCardProps) => {
  const formatVND = (value: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  const isList = variant === "list";
  const isCart = variant === "cart";
  if (isCart) {
    return (
      <div className="flex flex-row gap-4 mt-4">
        <img
          src={product.image}
          alt=""
          className="rounded-lg w-28 h-full object-cover shrink-0"
        />
        <div className="flex flex-col flex-1">
          <div className="flex flex-row justify-between items-center">
            <p className="text-xl font-bold">{product.title}</p>
            <button
              onClick={onRemove}
              className="hover:scale-110 transition-opacity text-gray-700 hover:text-red-600"
            >
              <Trash2 size={20} />
            </button>
          </div>
          <div className="flex flex-col gap-2 mt-1">
            <p className="text-[14px] text-gray-700">{product.category}</p>
            <div className="flex flex-row justify-between items-center">
              <div className="flex flex-row gap-5 items-center">
                <button
                  onClick={onDecrease}
                  className={`rounded-lg shadow-sm border p-1.5 ${
                    quantity === 1
                      ? "cursor-not-allowed bg-gray-50"
                      : "cursor-pointer border-black/20 hover:shadow-md hover:scale-110 transition-all duration-300"
                  }`}
                  disabled={quantity === 1}
                >
                  <Minus size={18} />
                </button>
                <p className="font-medium text-md">{quantity}</p>
                <button
                  onClick={onIncrease}
                  className={`rounded-lg shadow-sm border p-1.5 ${
                    quantity === product.inStockCount
                      ? "cursor-not-allowed bg-gray-50"
                      : "cursor-pointer border-black/20 hover:shadow-md hover:scale-110 transition-all duration-300 "
                  }`}
                  disabled={quantity === product.inStockCount}
                >
                  <Plus size={18} />
                </button>
              </div>
              <div className="">
                <p className="text-xl font-bold">
                  {formatVND(product.price * quantity)}
                </p>
                <p className=" flex flex-row-reverse text-[12px] font-normal">
                  {formatVND(product.price)} mỗi cái
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div
      className={
        isList
          ? "group flex items-start gap-4 rounded-2xl overflow-hidden bg-white hover:shadow-lg transition-all duration-300 p-3 md:p-4"
          : "group flex flex-col rounded-2xl overflow-hidden bg-white hover:shadow-lg transition-all duration-300"
      }
    >
      <div
        className={
          isList
            ? "relative w-36 h-36 md:w-44 md:h-44 shrink-0 overflow-hidden rounded-xl bg-gray-100"
            : "relative aspect-square w-full overflow-hidden bg-gray-100"
        }
      >
        <img
          src={product.image}
          alt={product.title}
          className={
            isList
              ? "w-full h-full object-cover"
              : "w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          }
        />
        <p className="absolute top-2 left-2 md:left-3 font-bold text-black text-xs md:text-sm">
          {product.isSale
            ? `${product.percent}% GIẢM`
            : product.isBestSeller
            ? "Bán chạy"
            : product.isNew
            ? "Mới"
            : null}
        </p>
      </div>

      <div
        className={
          isList
            ? "flex-1 flex flex-col gap-2"
            : "flex flex-col gap-3 px-2 py-3"
        }
      >
        <p
          className={
            isList
              ? "font-bold text-lg md:text-xl text-gray-900"
              : "font-bold text-md text-gray-900"
          }
        >
          {product.title}
        </p>
        {!isList && (
          <p className="font-sans text-gray-700 text-[14px]">
            {product.category}
          </p>
        )}

        {isList ? (
          <>
            <p className="text-sm text-gray-300 md:text-gray-700">
              {product.category}
            </p>
            <p className="text-sm text-gray-200 md:text-gray-700">
              {product.description}
            </p>
            {(product.balance || product.material || product.stringTension) && (
              <div className="hidden md:grid grid-cols-3 gap-4 text-xs text-gray-600">
                {product.balance && <span>balance: {product.balance}</span>}
                {product.material && <span>material: {product.material}</span>}
                {product.stringTension && (
                  <span>stringTension: {product.stringTension}</span>
                )}
              </div>
            )}
          </>
        ) : (
          variant === "default" && (
            <p className="font-sans text-gray-700 text-xs">
              {product.description}
            </p>
          )
        )}

        <div className="flex items-center gap-1">
          <Star size={15} />
          <p className="text-xs text-gray-700">{product.rating}</p>
          <p className="text-xs text-gray-700">({product.countRating})</p>
        </div>

        <div
          className={
            isList
              ? "mt-2 flex items-center justify-between"
              : "flex flex-row gap-2 items-center justify-between"
          }
        >
          <div className="flex items-baseline gap-2">
            <p
              className={
                isList ? "font-extrabold text-2xl" : "font-bold text-2xl"
              }
            >
              {formatVND(product.price)}
            </p>
            {product.isSale && (
              <p className="text-sm line-through text-gray-500">
                {formatVND(product.price)}
              </p>
            )}
          </div>

          {isList && (
            <p
              className={`text-xs ${
                product.inStockCount > 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {product.inStockCount > 0
                ? `Còn hàng (${product.inStockCount} sản phẩm)`
                : "Hết hàng"}
            </p>
          )}

          <button
            className={
              isList
                ? "flex items-center gap-2 text-sm hover:opacity-80"
                : "p-2 rounded-full hover:bg-gray-100 transition-colors"
            }
            aria-label="Add to cart"
          >
            {isList && (
              <div className="flex flex-row gap-3">
                <ShoppingCart size={isList ? 18 : 20} />
                <span>Thêm vào giỏ</span>
              </div>
            )}
          </button>
        </div>

        {!isList && (
          <>
            <div>
              {product.inStockCount > 0 ? (
                <p className="font-sans text-green-600 text-xs">
                  Còn hàng ({product.inStockCount} sản phẩm)
                </p>
              ) : (
                <p className="font-sans text-red-600 text-xs">Hết hàng</p>
              )}
            </div>
            <button
              className={`w-full mt-2 px-4 py-2 rounded-lg text-black font-semibold ${
                product.inStockCount > 0
                  ? "bg-white-600"
                  : "bg-white-600 cursor-not-allowed"
              }`}
              disabled={product.inStockCount === 0}
            >
              <div className="flex items-center justify-center gap-2">
                <ShoppingCart size={18} />
                Thêm vào giỏ
              </div>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
