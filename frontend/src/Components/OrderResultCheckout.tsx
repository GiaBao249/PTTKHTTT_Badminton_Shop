import { ArrowUpRight, CircleCheck, Home, ShoppingBag } from "lucide-react";
import { animateScrollToTop } from "../utils/scroll/animateScrollToTop";
import { useNavigate } from "react-router-dom";

const OrderResultCheckout = () => {
  const navigate = useNavigate();

  const handleBackToHome = () => {
    navigate("/");
    animateScrollToTop(window, 700);
  };

  const handleBackToShop = () => {
    navigate("/products-page?category=all");
    animateScrollToTop(window, 700);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center space-y-8 transform transition-all duration-300 hover:shadow-3xl">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-20"></div>
              <div className="absolute inset-0 bg-green-200 rounded-full animate-pulse opacity-30"></div>

              <div className="relative bg-gradient-to-br from-green-400 to-emerald-600 rounded-full p-6 shadow-lg transform hover:scale-110 transition-transform duration-300">
                <CircleCheck className="w-24 h-24 text-white" strokeWidth={3} />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h1 className="text-3xl md:text-5xl text-green-600 font-bold">
              Đặt hàng thành công!
            </h1>
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
              Cảm ơn quý khách đã tin tưởng và ủng hộ shop
            </p>
            <div className="pt-4">
              <p className="text-sm text-gray-500">
                Đơn hàng của bạn đang được xử lý và sẽ được giao trong thời gian
                sớm nhất
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 py-4">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-green-300"></div>
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-green-300"></div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <button
              onClick={handleBackToHome}
              className="group relative px-8 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
              <span className="absolute inset-0 w-3 bg-white opacity-0 group-hover:opacity-20 group-hover:w-full transition-all duration-700 transform -skew-x-12 group-hover:translate-x-full"></span>

              <div className="relative flex items-center justify-center gap-3">
                <Home
                  size={20}
                  className="group-hover:scale-110 transition-transform"
                />
                <span>Quay về trang chủ</span>
                <ArrowUpRight
                  size={18}
                  className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
                />
              </div>
            </button>

            <button
              onClick={handleBackToShop}
              className="group relative px-8 py-4 bg-white text-indigo-600 border-2 border-indigo-600 rounded-xl font-semibold shadow-md hover:shadow-xl hover:bg-indigo-50 transform hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-center justify-center gap-3">
                <ShoppingBag
                  size={20}
                  className="group-hover:scale-110 transition-transform"
                />
                <span>Xem sản phẩm khác</span>
                <ArrowUpRight
                  size={18}
                  className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
                />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderResultCheckout;
