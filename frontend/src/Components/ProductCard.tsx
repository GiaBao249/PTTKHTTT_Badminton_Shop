import { ShoppingCart, Star } from "lucide-react";
import type {
  Products,
  ProductCardVariant,
} from "../types/ProductTypes/ProductType";
type ProductCardProps = {
  product: Products;
  variant?: ProductCardVariant;
};
const ProductCard = ({ product, variant = "default" }: ProductCardProps) => {
  const isList = variant === "list";
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
            ? `${product.percent}% OFF`
            : product.isBestSeller
            ? "Best Seller"
            : product.isNew
            ? "New"
            : null}
        </p>
      </div>

      <div
        className={
          isList
            ? "flex-1 flex flex-col gap-2"
            : "flex flex-col gap-3 px-2 py-4"
        }
      >
        {!isList && (
          <p className="font-sans text-gray-700 text-xs">
            {product.company} • {product.color}
          </p>
        )}

        <p
          className={
            isList
              ? "font-bold text-lg md:text-xl text-gray-900"
              : "font-bold text-md text-gray-900"
          }
        >
          {product.title}
        </p>

        {isList ? (
          <>
            <p className="text-sm text-gray-300 md:text-gray-400">
              {product.company} • {product.color}
            </p>
            <p className="text-sm text-gray-200 md:text-gray-400">
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
              ${product.price}
            </p>
            {product.isSale && (
              <p className="text-sm line-through text-gray-500">
                ${product.price}
              </p>
            )}
          </div>

          <button
            className={
              isList
                ? "flex items-center gap-2 text-sm hover:opacity-80"
                : "p-2 rounded-full hover:bg-gray-100 transition-colors"
            }
            aria-label="Add to cart"
          >
            <ShoppingCart size={isList ? 18 : 20} />
            {isList && <span>Add to Cart</span>}
          </button>
        </div>

        {!isList && (
          <>
            <div>
              {product.inStockCount > 0 ? (
                <p className="font-sans text-green-600 text-xs">
                  In Stock ({product.inStockCount} available)
                </p>
              ) : (
                <p className="font-sans text-red-600 text-xs">Out of Stock</p>
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
                Add to Cart
              </div>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
