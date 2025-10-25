import { useState } from "react";
import { ChevronLeft, ChevronRight, Columns3, List } from "lucide-react";
import ProductCard from "./ProductCard";
import type { Products } from "../types/ProductTypes/ProductType";
import img1 from "../assets/c2.jpg";
import DropdownSelect from "./DropDownSelect";
import { Link } from "react-router-dom";
const ListOfProducts = () => {
  const [selectedFilter, setSelectedFilter] = useState<string>("Relevance");
  const [selectedPerPage, setSelectedPerPage] = useState<string>("6 per Page");
  const [isGridView, setIsGridView] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const dataFilterButton: string[] = [
    "Relevance",
    "Price: Low to high",
    "Price: High to low",
    "Popularity",
    "Rating",
  ];
  const dataPerPageButton: string[] = [
    "6 per Page",
    "9 per Page",
    "12 per Page",
  ];

  const handleView = (isGridView: boolean) => {
    setIsGridView(isGridView);
  };

  const ProductData: Products[] = [
    {
      id: 1,
      title: "Turbo X 90",
      image: img1,
      price: 239.99,
      isSale: true,
      percent: 15,
      rating: 4.6,
      countRating: 120,
      company: "Li-Ning",
      color: "Sold 654",
      inStockCount: 12,
      description: "Speed and agility for the quick player.",
    },
    {
      id: 2,
      title: "Turbo X 90",
      image: img1,
      price: 239.99,
      isSale: true,
      percent: 12,
      rating: 4.6,
      countRating: 120,
      company: "Li-Ning",
      color: "Sold 654",
      inStockCount: 12,
      description: "Speed and agility for the quick player.",
    },
    {
      id: 3,
      title: "Turbo X 90",
      image: img1,
      price: 239.99,
      isSale: true,
      percent: 12,
      rating: 4.6,
      countRating: 120,
      company: "Li-Ning",
      color: "Sold 654",
      inStockCount: 12,
      description: "Speed and agility for the quick player.",
    },
    {
      id: 4,
      title: "Turbo X 90",
      image: img1,
      price: 239.99,
      isSale: true,
      percent: 18,
      rating: 4.6,
      countRating: 120,
      company: "Li-Ning",
      color: "Sold 654",
      inStockCount: 12,
      description: "Speed and agility for the quick player.",
    },
    {
      id: 5,
      title: "Aerosonic Pro",
      image: img1,
      price: 199.99,
      isSale: false,
      percent: 0,
      isNew: true,
      rating: 4.8,
      countRating: 85,
      company: "Yonex",
      color: "Sold 430",
      inStockCount: 8,
      description: "Aerodynamic design for speed.",
    },
    {
      id: 6,
      title: "N&B Pro Racket 3000",
      image: img1,
      price: 199.99,
      isSale: false,
      percent: 0,
      rating: 4.8,
      countRating: 85,
      company: "N&B",
      color: "Sold 220",
      inStockCount: 5,
      description: "Premium performance racket.",
    },
    {
      id: 7,
      title: "Court Master Pro",
      image: img1,
      price: 199.99,
      isSale: false,
      isNew: true,
      rating: 4.8,
      countRating: 85,
      company: "Victor",
      color: "Sold 350",
      inStockCount: 10,
      description: "Versatile racket for all players.",
    },
  ];

  const itemsPerPage = parseInt(selectedPerPage.split(" ")[0]);
  const totalPages = Math.ceil(ProductData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = ProductData.slice(startIndex, endIndex);
  const handleFilterSelect = (filter: string) => {
    setSelectedFilter(filter);
  };
  const toSlug = (s: string) =>
    s
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  const handlePerPageSelect = (perPage: string) => {
    setSelectedPerPage(perPage);
    setCurrentPage(1);
  };
  const handlePageChange = (pageNumber: number) => {
    const next = Math.min(Math.max(pageNumber, 1), totalPages);
    setCurrentPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-row space-x-4 justify-between">
        <div className="flex flex-row gap-4 items-start">
          <DropdownSelect
            options={dataFilterButton}
            selectedOption={selectedFilter}
            onOptionSelect={handleFilterSelect}
            width="w-[200px]"
          />
          <DropdownSelect
            options={dataPerPageButton}
            selectedOption={selectedPerPage}
            onOptionSelect={handlePerPageSelect}
            width="w-[130px]"
          />
        </div>
        <div className="flex flex-row gap-4 mt-1">
          <button
            onClick={() => handleView(true)}
            className="hover:bg-gray-100 p-1 rounded transition-colors"
          >
            <Columns3 className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleView(false)}
            className="hover:bg-gray-100 p-1 rounded transition-colors"
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div
        className={`${
          isGridView
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            : "flex flex-col"
        } gap-4`}
      >
        {currentProducts.map((product, index) => {
          const slug = toSlug(product.title);
          return (
            <Link
              to={`/product/${slug}`}
              state={product}
              key={product.id}
              className={isGridView ? "" : "w-full"}
            >
              <ProductCard
                product={product}
                variant={isGridView ? "default" : "list"}
                key={index}
              />
            </Link>
          );
        })}
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-12 mt-8">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-black/10 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`min-w-[40px] h-[40px] rounded-lg border transition-colors ${
                  currentPage === page
                    ? "bg-black text-white border-black"
                    : "border-black/10 hover:bg-gray-100"
                }`}
              >
                {page}
              </button>
            ))}
          </div>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-black/10 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
      <div className="text-center text-sm text-gray-600">
        Showing {startIndex + 1}-{Math.min(endIndex, ProductData.length)} of{" "}
        {ProductData.length} products
      </div>
    </div>
  );
};

export default ListOfProducts;
