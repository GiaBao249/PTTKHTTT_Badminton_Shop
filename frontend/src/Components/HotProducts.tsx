import { useState } from "react";
import ProductCard from "./ProductCard";
import img1 from "../assets/c2.jpg";
import { MoveRight } from "lucide-react";
import type { Products } from "../types/ProductTypes/ProductType";
type Description = {
  title: string;
  des: string;
  shop: string;
};
const HotProducts = () => {
  const [selectedDescription, setSelectedDescription] = useState<Description>({
    title: "Rackets",
    des: "Discover our premium collection of professional-grade rackets. Engineered for performance, designed for champions",
    shop: "Racket Shop",
  });

  const DataHotProducts: Products[] = [
    {
      title: "Turbo X 90",
      image: img1,
      price: 239.99,
      isSale: true,
      sale: { percent: "15%" },
      rating: 4.6,
      countRating: 120,
      company: "Li-Ning",
      color: "Sold 654",
      inStockCount: 12,
      description: "Speed and agility for the quick player.",
    },
    {
      title: "Aerosonic Pro",
      image: img1,
      price: 199.99,
      isSale: false,
      sale: { percent: "New" },
      rating: 4.8,
      countRating: 85,
      company: "Yonex",
      color: "Sold 430",
      inStockCount: 8,
      description: "Aerodynamic design for speed.",
    },
    {
      title: "N&B Pro Racket 3000",
      image: img1,
      price: 199.99,
      isSale: false,
      sale: { percent: "" },
      rating: 4.8,
      countRating: 85,
      company: "N&B",
      color: "Sold 220",
      inStockCount: 5,
      description: "Premium performance racket.",
    },
    {
      title: "Court Master Pro",
      image: img1,
      price: 199.99,
      isSale: false,
      sale: { percent: "10%" },
      rating: 4.8,
      countRating: 85,
      company: "Victor",
      color: "Sold 350",
      inStockCount: 10,
      description: "Versatile racket for all players.",
    },
  ];

  function handleDescriptionClick(description: Description) {
    setSelectedDescription(description);
  }
  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Hot Products
          </h2>
          <p className="text-gray-600 text-normal text-xl text-center max-w-2xl mb-8">
            Trending items this season
          </p>
        </div>
        <div className="flex flex-row items-center gap-4 justify-center mb-8 px-4">
          <button
            className="rounded-md font-medium text-black border border-black/20 w-[100px] h-[35px] text-sm"
            onClick={() =>
              handleDescriptionClick({
                title: "Rackets",
                des: "Discover our premium collection of professional-grade rackets. Engineered for performance, designed for champions",
                shop: "Racket Shop",
              })
            }
          >
            Rackets
          </button>
          <button
            className="rounded-md font-medium text-black border border-black/20 w-[100px] h-[35px] text-sm"
            onClick={() =>
              handleDescriptionClick({
                title: "Shoes",
                des: "Discover our premium collection of professional-grade shoes. Engineered for performance, designed for champions.",
                shop: "Shoe Shop",
              })
            }
          >
            Shoes
          </button>
          <button
            className="rounded-md font-medium text-black border border-black/20 w-[120px] h-[35px] text-sm"
            onClick={() =>
              handleDescriptionClick({
                title: "Shuttlecocks",
                des: "Discover our premium collection of professional-grade shuttlecocks. Engineered for performance, designed for champions.",
                shop: "Shuttlecock Shop",
              })
            }
          >
            Shuttlecocks
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3 relative">
            <p className="font-medium text-xs">FEATURED CATEGORY</p>
            <p className="font-bold text-4xl">{selectedDescription.title}</p>
            <p className="font-sans text-sm w-max-md w-[400px]">
              {selectedDescription.des}
            </p>
            <div className="absolute flex flex-row gap-4 bottom-10">
              <div className="flex flex-row gap-4 items-center text-sm font-medium text-black w-max px-4 py-2 cursor-pointer group">
                <p className="w-full text-sm">
                  Shop {selectedDescription.title}
                </p>
                <div className="transition-all duration-300 group-hover:translate-x-1 group-hover:scale-120 group-hover:pl-2">
                  <MoveRight size={18} />
                </div>
              </div>
              <button className="text-[16px] font-medium border border-black/50 rounded-lg h-10 w-32">
                View Deals
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {DataHotProducts.map((data, index) => {
              return (
                <ProductCard product={data} variant="minimal" key={index} />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HotProducts;
