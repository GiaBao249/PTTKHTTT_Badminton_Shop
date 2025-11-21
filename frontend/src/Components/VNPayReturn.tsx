import { useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { CheckCircle, XCircle } from "lucide-react";

const VNPayReturn = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = window.location.pathname;
  const isSuccess = location.includes("/success");
  const orderId = searchParams.get("order_id");
  const amount = searchParams.get("amount");
  const error = searchParams.get("error");

  useEffect(() => {
    // Auto redirect sau 5 giây nếu thành công
    if (isSuccess && orderId) {
      const timer = setTimeout(() => {
        navigate(`/result-order/${orderId}`);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, orderId, navigate]);

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Thanh toán thành công!
          </h1>
          <p className="text-gray-600 mb-4">
            Cảm ơn bạn đã thanh toán đơn hàng của chúng tôi.
          </p>
          {orderId && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Mã đơn hàng</p>
              <p className="text-lg font-semibold text-gray-900">
                #{orderId}
              </p>
              {amount && (
                <p className="text-sm text-gray-600 mt-2">
                  Số tiền:{" "}
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(Number(amount))}
                </p>
              )}
            </div>
          )}
          <div className="flex gap-4">
            <Link
              to="/account"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Xem đơn hàng
            </Link>
            {orderId && (
              <Link
                to={`/result-order/${orderId}`}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Chi tiết đơn hàng
              </Link>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-4">
            Bạn sẽ được chuyển hướng tự động sau 5 giây...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="flex justify-center mb-4">
          <XCircle className="w-16 h-16 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Thanh toán thất bại
        </h1>
        {error && (
          <p className="text-red-600 mb-4">{decodeURIComponent(error)}</p>
        )}
        {orderId && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Mã đơn hàng</p>
            <p className="text-lg font-semibold text-gray-900">#{orderId}</p>
          </div>
        )}
        <div className="flex gap-4">
          <Link
            to="/cart-page"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Quay về giỏ hàng
          </Link>
          {orderId && (
            <Link
              to={`/checkout`}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Thử lại
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default VNPayReturn;

