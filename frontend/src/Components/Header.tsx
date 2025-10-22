import { ShoppingCart, Moon, User, Search, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const Header = () => {
  const [isProductsOpen, setIsProductsOpen] = useState(false);
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
                  Home
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setIsProductsOpen(!isProductsOpen)}
                    className="flex items-center gap-1 text-gray-700 hover:text-black"
                  >
                    Product
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
                        to="/ProductsPage?category=all"
                        className="block px-4 py-2 text-gray-700 hover:bg-black/10 transition-colors"
                        onClick={() => setIsProductsOpen(false)}
                      >
                        All Products
                      </Link>
                      <Link
                        to="/ProductsPage?category=rackets"
                        onClick={() => setIsProductsOpen(false)}
                        className="block px-4 py-2 text-gray-700 hover:bg-black/10 transition-colors"
                      >
                        Rackets
                      </Link>
                      <Link
                        to="/ProductsPage?category=shoes"
                        onClick={() => setIsProductsOpen(false)}
                        className="block px-4 py-2 text-gray-700 hover:bg-black/10 transition-colors"
                      >
                        Shoes
                      </Link>
                      <Link
                        to="/ProductsPage?category=shuttlecocks"
                        onClick={() => setIsProductsOpen(false)}
                        className="block px-4 py-2 text-gray-700 hover:bg-black/10 transition-colors"
                      >
                        Shuttlecocks
                      </Link>
                      <Link
                        to="/ProductsPage?category=strings"
                        className="block px-4 py-2 text-gray-700 hover:bg-black/10 transition-colors"
                        onClick={() => setIsProductsOpen(false)}
                      >
                        Strings
                      </Link>
                      <Link
                        to="/ProductsPage?category=accessories"
                        onClick={() => setIsProductsOpen(false)}
                        className="block px-4 py-2 text-gray-700 hover:bg-black/10 transition-colors"
                      >
                        Accessories
                      </Link>
                    </div>
                  )}
                </div>
                <a
                  href="#"
                  className="text-gray-700 hover:text-black transition-colors"
                >
                  Contact
                </a>
                <a
                  href="#"
                  className="text-gray-700 hover:text-black transition-colors"
                >
                  Sale
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
                  placeholder="Search products..."
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
            <button
              aria-label="Cart"
              className="p-2 rounded-full hover:bg-black/5 text-gray-700 transition-colors"
            >
              <ShoppingCart size={20} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
