import { ShoppingCart, Moon, Search, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import UserMenu from "./UserMenu";
import { useAuth } from "../contexts/AuthContext";
import { cartService } from "../services/cartService";

const Header = () => {
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const { user, token } = useAuth();
  const [cartCount, setCartCount] = useState(0);
  const itemIdSetRef = useRef<Set<number>>(new Set());
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
            <div className="relative w-full">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="search"
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full h-10 pl-10 pr-4 rounded-xl border border-black/10 bg-white text-gray-900 placeholder:text-gray-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-black/10"
              />
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
