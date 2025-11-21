import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Columns3, List } from "lucide-react";
import ProductCard from "./ProductCard";
import DropdownSelect from "./DropDownSelect";
import { Link } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import type {
  ProductListItem,
  Products,
} from "../types/ProductTypes/ProductType";
import { toUIProduct } from "../utils/productMapper";
import { animateScrollToTop } from "../utils/scroll/animateScrollToTop";
import { cartService } from "../services/cartService";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";
import type { PriceRange } from "./MainProducts";
const API_BASE = import.meta.env.VITE_API_URL;
type Props = {
  selectedOptionIds?: number[];
  categoryId?: number | undefined;
  priceRange?: PriceRange;
  nameFilter?: string;
};
const ListOfProducts = ({
  selectedOptionIds = [],
  categoryId,
  priceRange,
  nameFilter,
}: Props) => {
  const [selectedFilter, setSelectedFilter] = useState<string>("Liên quan");
  const [selectedPerPage, setSelectedPerPage] =
    useState<string>("6sp mỗi trang");
  const [isGridView, setIsGridView] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const dataFilterButton: string[] = [
    "Liên quan",
    "Giá: Thấp đến cao",
    "Giá: Cao đến thấp",
  ];
  const dataPerPageButton: string[] = [
    "6sp mỗi trang",
    "9sp mỗi trang",
    "12sp mỗi trang",
  ];

  const [searchParams] = useSearchParams();
  const category = searchParams.get("category") || "all";
  const searchQuery = searchParams.get("search");

  const handleView = (isGridView: boolean) => {
    setIsGridView(isGridView);
  };
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<ProductListItem[]>([]);
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // If search query exists, use search API
        if (searchQuery && searchQuery.trim().length > 0) {
          const keyword = encodeURIComponent(searchQuery.trim());
          const res = await fetch(`${API_BASE}/api/products/search/${keyword}`);
          if (!res.ok) {
            throw Error(`HTTP ${res.status}`);
          }
          const data: ProductListItem[] = await res.json();
          setProducts(data);
        } else if (!selectedOptionIds || selectedOptionIds.length === 0) {
          const url =
            categoryId != null
              ? `${API_BASE}/api/products/category/${categoryId}`
              : `${API_BASE}/api/products`;
          const res = await fetch(url);
          if (!res.ok) {
            throw Error(`HTTP ${res.status}`);
          }
          const data: ProductListItem[] = await res.json();
          setProducts(data);
        } else {
          const res = await fetch(`${API_BASE}/api/products/filter`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              optionIds: selectedOptionIds,
              categoryId: categoryId,
            }),
          });
          if (!res.ok) {
            throw Error(`HTTP ${res.status}`);
          }
          const data: ProductListItem[] = await res.json();
          setProducts(data);
        }
        setCurrentPage(1);
      } catch (e: any) {
        setError(e.message || "Fetch failed");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [selectedOptionIds, categoryId, searchQuery]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [priceRange?.min, priceRange?.max, nameFilter]);

  const uiList: Products[] = useMemo(
    () => products.map(toUIProduct),
    [products]
  );

  const itemsPerPage = parseInt(selectedPerPage.split(" ")[0]);
  const sorted = useMemo(() => {
    let result = [...uiList];

    // Apply sorting
    switch (selectedFilter) {
      case "Giá: Thấp đến cao":
        result.sort((a, b) => a.price - b.price);
        break;
      case "Giá: Cao đến thấp":
        result.sort((a, b) => b.price - a.price);
        break;
      default:
        break;
    }

    return result;
  }, [uiList, selectedFilter]);

  // Apply price and name filters after sorting
  const filtered = useMemo(() => {
    let result = [...sorted];

    // Filter by price range
    if (priceRange) {
      if (priceRange.min != null) {
        result = result.filter((p) => p.price >= priceRange.min!);
      }
      if (priceRange.max != null) {
        result = result.filter((p) => p.price <= priceRange.max!);
      }
    }

    // Filter by name
    if (nameFilter && nameFilter.trim().length > 0) {
      const searchTerm = nameFilter.trim().toLowerCase();
      result = result.filter((p) => p.title.toLowerCase().includes(searchTerm));
    }

    return result;
  }, [sorted, priceRange, nameFilter]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filtered.slice(startIndex, endIndex);
  const handleFilterSelect = (filter: string) => {
    setSelectedFilter(filter);
  };

  const handlePerPageSelect = (perPage: string) => {
    setSelectedPerPage(perPage);
    setCurrentPage(1);
  };
  const handlePageChange = (pageNumber: number) => {
    const next = Math.min(Math.max(pageNumber, 1), totalPages);
    setCurrentPage(next);
    animateScrollToTop(window, 700);
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
            width="w-[150px]"
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
          return (
            <Link
              to={`/products-page/product/${product.id}`}
              state={product}
              key={product.id}
              className={isGridView ? "" : "w-full"}
            >
              <ProductCard
                product={product}
                variant={isGridView ? "default" : "list"}
                key={index}
                onAddToCart={async () => {
                  if (!token) {
                    toast.warning("Vui lòng đăng nhập");
                    return;
                  }

                  try {
                    const res = await fetch(
                      `${API_BASE}/api/products/${product.id}`
                    );
                    if (!res.ok) {
                      throw new Error("Không thể lấy thông tin sản phẩm");
                    }
                    const data = await res.json();
                    if (!data.items || data.items.length === 0) {
                      toast.warning("Sản phẩm không có phiên bản nào");
                      return;
                    }

                    const product_item_id = data.items[0].product_item_id;
                    await cartService.addItem(product_item_id, 1, token);
                    toast.success("Đã thêm vào giỏ hàng");
                    window.dispatchEvent(new CustomEvent("cart:reload"));
                  } catch (error) {
                    toast.warning(
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
        Hiển thị {startIndex + 1}-{Math.min(endIndex, filtered.length)} trên
        tổng {filtered.length} sản phẩm
      </div>
    </div>
  );
};

export default ListOfProducts;
