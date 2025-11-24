import { ShoppingCart, Moon, Search, ChevronDown, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import UserMenu from "./UserMenu";
import { useAuth } from "../contexts/AuthContext";
import { cartService } from "../services/cartService";
import type { ProductListItem } from "../types/ProductTypes/ProductType";

const API_BASE = import.meta.env.VITE_API_URL;

const Header = () => {
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const { user, token } = useAuth();
  const [cartCount, setCartCount] = useState(0);
  const itemIdSetRef = useRef<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<ProductListItem[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  useEffect(() => {
    let mounted = true;
    const loadCount = async () => {
      try {
        if (user?.role === "user" && token) {
          const items = await cartService.getCartItems(user.id, token);
          if (!mounted) return;
          const ids = new Set<number>();
          if (Array.isArray(items)) {
            for (const it of items) {
              const pid =
                it?.product_item?.product_item_id ?? it?.product_item_id;
              if (typeof pid === "number") ids.add(pid);
            }
          }
          itemIdSetRef.current = ids;
          setCartCount(ids.size);
        } else {
          setCartCount(0);
        }
      } catch (_) {}
    };
    loadCount();
    const onAdd = (e: any) => {
      const pid = e?.detail?.product_item_id;
      if (typeof pid !== "number") return;
      const set = itemIdSetRef.current;
      if (!set.has(pid)) {
        set.add(pid);
        setCartCount((c) => c + 1);
      }
    };
    const onRemove = (e: any) => {
      const pid = e?.detail?.product_item_id;
      if (typeof pid !== "number") return;
      const set = itemIdSetRef.current;
      if (set.has(pid)) {
        set.delete(pid);
        setCartCount((c) => Math.max(0, c - 1));
      }
    };
    const onReload = () => {
      loadCount();
    };
    window.addEventListener("cart:add", onAdd as EventListener);
    window.addEventListener("cart:remove", onRemove as EventListener);
    window.addEventListener("cart:reload", onReload as EventListener);
    return () => {
      mounted = false;
      window.removeEventListener("cart:add", onAdd as EventListener);
      window.removeEventListener("cart:remove", onRemove as EventListener);
      window.removeEventListener("cart:reload", onReload as EventListener);
    };
  }, [user, token]);
  const handleSetIsProductOpen = () => {
    setIsProductsOpen(false);
    // window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle search
  useEffect(() => {
    if (searchTerm.trim().length < 2) {
      setSearchResults([]);
      setIsSearchOpen(false);
      return;
    }

    setIsSearching(true);
    setIsSearchOpen(true);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce search
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const keyword = encodeURIComponent(searchTerm.trim());
        const res = await fetch(`${API_BASE}/api/products/search/${keyword}`);
        if (!res.ok) throw new Error("Search failed");
        const data: ProductListItem[] = await res.json();
        setSearchResults(data.slice(0, 5)); // Limit to 5 results
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products-page?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm("");
      setIsSearchOpen(false);
    }
  };

  const handleSearchResultClick = (product: ProductListItem) => {
    navigate(`/products-page/product/${product.product_id}`);
    setSearchTerm("");
    setIsSearchOpen(false);
  };
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-black/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20 gap-4">
          <div className="flex-shrink-0">
            <Link
              to="/"
              className="font-bold text-2xl tracking-tight text-gray-900"
            >
              N&B
            </Link>
          </div>

          <nav className="hidden lg:flex items-center gap-8 text-sm">
            <Link
              to="/"
              className="text-gray-700 hover:text-black transition-colors"
            >
              Trang chủ
            </Link>
            <div className="relative">
              <button
                onClick={() => setIsProductsOpen(!isProductsOpen)}
                className="flex items-center gap-1 text-gray-700 hover:text-black"
              >
                Sản phẩm
                <ChevronDown
                  size={16}
                  className={`transition-transform ${
                    isProductsOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isProductsOpen && (
                <div className="absolute top-full text-left left-0 mt-2 w-48 bg-white border border-black/10 rounded-lg shadow-lg py-2 z-50">
                  <Link
                    to="/products-page?category=all"
                    className="block px-4 py-2 text-gray-700 hover:bg-black/10 transition-colors"
                    onClick={() => handleSetIsProductOpen()}
                  >
                    Tất cả sản phẩm
                  </Link>
                  <Link
                    to="/products-page?category=rackets"
                    onClick={() => handleSetIsProductOpen()}
                    className="block px-4 py-2 text-gray-700 hover:bg-black/10 transition-colors"
                  >
                    Vợt cầu lông
                  </Link>
                  <Link
                    to="/products-page?category=clothes"
                    onClick={() => handleSetIsProductOpen()}
                    className="block px-4 py-2 text-gray-700 hover:bg-black/10 transition-colors"
                  >
                    Áo thể thao
                  </Link>
                  <Link
                    to="/products-page?category=shoes"
                    onClick={() => handleSetIsProductOpen()}
                    className="block px-4 py-2 text-gray-700 hover:bg-black/10 transition-colors"
                  >
                    Giày cầu lông
                  </Link>
                  <Link
                    to="/products-page?category=shuttlecocks"
                    onClick={() => handleSetIsProductOpen()}
                    className="block px-4 py-2 text-gray-700 hover:bg-black/10 transition-colors"
                  >
                    Quả cầu
                  </Link>
                  <Link
                    to="/products-page?category=accessories"
                    onClick={() => handleSetIsProductOpen()}
                    className="block px-4 py-2 text-gray-700 hover:bg-black/10 transition-colors"
                  >
                    Phụ kiện cầu lông
                  </Link>
                </div>
              )}
            </div>
            <a
              href="#"
              className="text-gray-700 hover:text-black transition-colors"
            >
              Liên hệ
            </a>
            <a
              href="#"
              className="text-gray-700 hover:text-black transition-colors"
            >
              Khuyến mãi
            </a>
          </nav>

          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full" ref={searchRef}>
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => {
                    if (searchResults.length > 0 || searchTerm.trim().length >= 2) {
                      setIsSearchOpen(true);
                    }
                  }}
                  className="w-full h-10 pl-10 pr-10 rounded-xl border border-black/10 bg-white text-gray-900 placeholder:text-gray-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm("");
                      setSearchResults([]);
                      setIsSearchOpen(false);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </form>

              {/* Search Results Dropdown */}
              {isSearchOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-black/10 rounded-xl shadow-lg z-50 max-h-96 overflow-y-auto">
                  {isSearching ? (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      Đang tìm kiếm...
                    </div>
                  ) : searchResults.length > 0 ? (
                    <>
                      {searchResults.map((product) => (
                        <button
                          key={product.product_id}
                          onClick={() => handleSearchResultClick(product)}
                          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-100 last:border-b-0"
                        >
                          <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                            {product.thumbnail ? (
                              <img
                                src={product.thumbnail}
                                alt={product.product_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Search size={16} className="text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">
                              {product.product_name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {product.category?.category_name || "Không có danh mục"}
                            </p>
                          </div>
                          <div className="text-sm font-semibold text-gray-900">
                            {new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            }).format(product.price)}
                          </div>
                        </button>
                      ))}
                      {searchTerm.trim() && (
                        <button
                          onClick={handleSearchSubmit}
                          className="w-full px-4 py-3 text-center text-indigo-600 hover:bg-indigo-50 font-medium transition-colors border-t border-gray-200"
                        >
                          Xem tất cả kết quả cho "{searchTerm}"
                        </button>
                      )}
                    </>
                  ) : searchTerm.trim().length >= 2 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      Không tìm thấy sản phẩm nào
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              aria-label="Toggle theme"
              className="hidden md:block p-2 rounded-full hover:bg-black/5 text-gray-700 transition-colors"
            >
              <Moon size={20} />
            </button>
            {user?.role === "user" ? (
              <Link to="/cart-page">
                <button
                  id="cart-icon"
                  aria-label="Cart"
                  className="relative p-2 rounded-full hover:bg-black/5 text-gray-700 transition-colors"
                >
                  <ShoppingCart size={20} />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] leading-5 text-center font-semibold">
                      {cartCount}
                    </span>
                  )}
                </button>
              </Link>
            ) : (
              ""
            )}
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
