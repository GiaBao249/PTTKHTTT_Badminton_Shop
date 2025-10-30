import { ShoppingCart, Moon, User, Search, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const Header = () => {
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const handleSetIsProductOpen = () => {
    setIsProductsOpen(false);
    // window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-black/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-[auto_1fr_auto] items-center h-16 md:h-20 gap-4">
          <div className="flex items-center">
            <Link
              to="/"
              className="font-bold text-2xl tracking-tight text-gray-900"
            >
              N&B
            </Link>
          </div>
          <div className="flex justify-center">
            <div className="flex items-center gap-6 lg:gap-8">
              <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm">
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
                        TẤT CẢ SẢN PHẨM
                      </Link>
                      <Link
                        to="/products-page?category=rackets"
                        onClick={() => handleSetIsProductOpen()}
                        className="block px-4 py-2 text-gray-700 hover:bg-black/10 transition-colors"
                      >
                        VỢT CẦU LÔNG
                      </Link>
                      <Link
                        to="/products-page?category=clothes"
                        onClick={() => handleSetIsProductOpen()}
                        className="block px-4 py-2 text-gray-700 hover:bg-black/10 transition-colors"
                      >
                        ÁO THỂ THAO
                      </Link>
                      <Link
                        to="/products-page?category=shoes"
                        onClick={() => handleSetIsProductOpen()}
                        className="block px-4 py-2 text-gray-700 hover:bg-black/10 transition-colors"
                      >
                        GIÀY CẦU LÔNG
                      </Link>
                      <Link
                        to="/products-page?category=shuttlecocks"
                        onClick={() => handleSetIsProductOpen()}
                        className="block px-4 py-2 text-gray-700 hover:bg-black/10 transition-colors"
                      >
                        QUẢ CẦU
                      </Link>
                      <Link
                        to="/products-page?category=accessories"
                        onClick={() => handleSetIsProductOpen()}
                        className="block px-4 py-2 text-gray-700 hover:bg-black/10 transition-colors"
                      >
                        PHỤ KIỆN CẦU LÔNG
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

              <div className="relative w-[520px] max-w-full ml-10">
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
          </div>
          <div className="ml-auto flex items-center gap-4">
            <button
              aria-label="Toggle theme"
              className="p-2 rounded-full hover:bg-black/5 text-gray-700 transition-colors"
            >
              <Moon size={20} />
            </button>
            <button
              aria-label="Account"
              className="p-2 rounded-full hover:bg-black/5 text-gray-700 transition-colors"
            >
              <User size={20} />
            </button>
            <Link to="/cart-page">
              <button
                aria-label="Cart"
                className="p-2 rounded-full hover:bg-black/5 text-gray-700 transition-colors"
              >
                <ShoppingCart size={20} />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
