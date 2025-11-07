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
const API_BASE = import.meta.env.VITE_API_URL;
type Props = { selectedOptionIds?: number[]; categoryId?: number | undefined };
const ListOfProducts = ({ selectedOptionIds = [], categoryId }: Props) => {
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
        if (!selectedOptionIds || selectedOptionIds.length === 0) {
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
  }, [selectedOptionIds, categoryId]);

  const uiList: Products[] = useMemo(
    () => products.map(toUIProduct),
    [products]
  );

  const itemsPerPage = parseInt(selectedPerPage.split(" ")[0]);
  const sorted = useMemo(() => {
    switch (selectedFilter) {
      case "Giá: Thấp đến cao":
        return [...uiList].sort((a, b) => a.price - b.price);
      case "Giá: Cao đến thấp":
        return [...uiList].sort((a, b) => b.price - a.price);
      default:
        return uiList;
    }
  }, [uiList, selectedFilter]);
  const totalPages = Math.ceil(sorted.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = sorted.slice(startIndex, endIndex);
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
                    alert("Vui lòng đăng nhập");
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
                      alert("Sản phẩm không có phiên bản nào");
                      return;
                    }

                    const product_item_id = data.items[0].product_item_id;
                    await cartService.addItem(product_item_id, 1, token);
                    alert("Đã thêm vào giỏ hàng");
                  } catch (error) {
                    alert(
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
        Hiển thị {startIndex + 1}-{Math.min(endIndex, sorted.length)} trên tổng{" "}
        {sorted.length} sản phẩm
      </div>
    </div>
  );
};

export default ListOfProducts;
