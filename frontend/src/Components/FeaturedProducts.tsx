import { ShoppingCart, Star } from "lucide-react";
import ProductCard from "./ProductCard";
import img1 from "../assets/c1.jpg";
const FeaturedProducts = () => {
  const products = [
    {
      title: "Astrox 99 Pro",
      image: img1,
      price: 249.99,
      rating: 4.8,
      reviews: 120,
      inStockCount: 15,
      description: "Lightweight racket for power and control.",
      information: "Shaft Flex: Stiff, Weight: 88g, Balance: Head Heavy",
      Category: "Rackets",
      company: "Yonex",
      color: "Sold 1200",
      type: {
        isSale: true,
        isBestSeller: true,
        isNew: false,
        salePercent: "15%",
      },
    },
    {
      title: "Jetspeed S 12",
      image: img1,
      price: 229.99,
      rating: 4.7,
      reviews: 95,
      inStockCount: 10,
      description: "Aerodynamic design for quick swings.",
      information: "Shaft Flex: Medium, Weight: 87g, Balance: Even",
      company: "Victor",
      Category: "Rackets",
      color: "Sold 899",
      type: {
        isSale: false,
        isBestSeller: true,
        isNew: false,
        salePercent: "15%",
      },
    },
    {
      title: "Turbo X 90",
      image: img1,
      price: 239.99,
      rating: 4.6,
      reviews: 80,
      inStockCount: 12,
      description: "Speed and agility for the quick player.",
      information: "Shaft Flex: Stiff, Weight: 89g, Balance: Head Heavy",
      Category: "Rackets",
      company: "Li-Ning",
      color: "Sold 654",
      type: {
        isSale: false,
        isBestSeller: false,
        isNew: true,
        salePercent: "15%",
      },
    },
    {
      title: "SHB 65X VA - Grayish Beige",
      image: img1,
      price: 119.99,
      rating: 4.5,
      reviews: 60,
      inStockCount: 0,
      description: "Comfortable and durable badminton shoes.",
      information: "Size: 6-12, Weight: 350g, Material: Synthetic",
      Category: "Shoes",
      company: "Yonex",
      color: "Sold 430",
      type: {
        isSale: true,
        isBestSeller: false,
        isNew: false,
        salePercent: "15%",
      },
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
          <button className=" mt-5 shadow-sm rounded-lg h-10 border border-black/20 px-4 hover:shadow-md hover:scale-105 transition-all duration-300">
            View All
          </button>
        </div>
        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 xl:gap-7 mt-8 rounded-lg">
          {products.map((product, index) => (
            <ProductCard product={product} variant="default" key={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
