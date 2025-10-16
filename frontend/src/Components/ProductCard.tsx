import { ShoppingCart, Star } from "lucide-react";

type ProductType = {
  isSale: boolean;
  salePercent?: string;
  isBestSeller?: boolean;
  isNew?: boolean;
};

type Product = {
  title: string;
  image: string;
  price: number;
  rating: number;
  reviews: number;
  inStockCount: number;
  company: string;
  color: string;
  description?: string;
  type: ProductType;
};

type ProductCardVariant = "default" | "compact" | "minimal";

type ProductCardProps = {
  product: Product;
  variant?: ProductCardVariant;
};

const ProductCard = ({ product, variant = "default" }: ProductCardProps) => {
  return (
    <div className="group flex flex-col rounded-2xl overflow-hidden bg-white hover:shadow-lg transition-all duration-300">
      <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
        <p className="absolute top-2 left-4 font-bold text-black text-sm">
          {product.type.isSale
            ? product.type.salePercent + " OFF"
            : product.type.isBestSeller
            ? "Best Seller"
            : product.type.isNew
            ? "New"
            : null}
        </p>
      </div>

      <div className="flex flex-col gap-3 px-2 py-4">
        {variant !== "minimal" && (
          <p className="font-sans text-gray-700 text-xs">
            {product.company} • {product.color}
          </p>
        )}

        <p className="font-bold text-md text-gray-900">{product.title}</p>

        {variant === "default" && (
          <p className="font-sans text-gray-700 text-xs">
            {product.description}
          </p>
        )}

        <div className="flex flex-row gap-0.5 justify-start">
          <Star size={15} />
          <p className="font-sans text-gray-700 text-xs">{product.rating}</p>
          <p className="font-sans text-gray-700 text-xs">
            ({product.reviews} reviews)
          </p>
        </div>

        <div className="flex flex-row gap-2 items-center justify-between">
          <div className="flex flex-row gap-2 items-baseline">
            <p className="font-bold text-2xl">${product.price}</p>
            {product.type.isSale && (
              <p className="font-sans text-xl line-through text-gray-500">
                ${product.price}
              </p>
            )}
          </div>

          {variant === "minimal" && (
            <button
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Add to cart"
            >
              <ShoppingCart size={20} />
            </button>
          )}
        </div>

        {variant !== "minimal" && (
          <div>
            {product.inStockCount > 0 ? (
              <p className="font-sans text-green-600 text-xs">
                In Stock ({product.inStockCount} available)
              </p>
            ) : (
              <p className="font-sans text-red-600 text-xs">Out of Stock</p>
            )}
          </div>
        )}

        {variant !== "minimal" && (
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
        )}
      </div>
    </div>
  );
};

export default ProductCard;
