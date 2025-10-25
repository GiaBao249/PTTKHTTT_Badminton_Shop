import ProductCard from "./ProductCard";
import img1 from "../assets/c1.jpg";
import { Link } from "react-router-dom";

const FeaturedProducts = () => {
  const toSlug = (s: string) =>
    s
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

  const products = [
    {
      id: 1,
      title: "Astrox 99 Pro",
      image: img1,
      price: 249.99,
      rating: 3,
      countRating: 120,
      inStockCount: 15,
      description: "Lightweight racket for power and control.",
      company: "Yonex",
      color: "Sold 1200",
      isSale: true,
      percent: 15,
    },
    {
      id: 2,
      title: "Jetspeed S 12",
      image: img1,
      price: 229.99,
      rating: 4.7,
      countRating: 95,
      inStockCount: 10,
      description: "Aerodynamic design for quick swings.",
      company: "Victor",
      color: "Sold 899",
      isSale: false,
      percent: 0,
    },
    {
      id: 3,
      title: "Turbo X 90",
      image: img1,
      price: 239.99,
      rating: 4.6,
      countRating: 80,
      inStockCount: 12,
      description: "Speed and agility for the quick player.",
      company: "Li-Ning",
      color: "Sold 654",
      isSale: false,
      percent: 0,
    },
    {
      id: 4,
      title: "SHB 65X VA - Grayish Beige",
      image: img1,
      price: 119.99,
      rating: 4.5,
      countRating: 60,
      inStockCount: 0,
      description: "Comfortable and durable badminton shoes.",
      company: "Yonex",
      color: "Sold 430",
      isSale: true,
      percent: 15,
    },
  ];

  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-row justify-between">
          <div>
            <h2 className="font-bold text-4xl text-gray-900">
              Featured Products
            </h2>
            <p className="font-light text-lg md:text-xl text-gray-600 pt-3">
              Top picks for serious players
            </p>
          </div>
          <Link to="/ProductsPage">
            <button className="mt-5 shadow-sm rounded-lg h-10 border border-black/20 px-4 hover:shadow-md hover:scale-105 transition-all duration-300">
              View All
            </button>
          </Link>
        </div>
        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 xl:gap-7 mt-8 rounded-lg">
          {products.map((product) => {
            const slug = toSlug(product.title);
            return (
              <Link to={`/product/${slug}`} state={product} key={product.id}>
                <ProductCard product={product} variant="default" />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
