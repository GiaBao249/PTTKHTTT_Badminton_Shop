import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const VietQRPayment = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [paymentStatus, setPaymentStatus] = useState<
    "pending" | "success" | "failed"
  >("pending");

  // Tạo URL test callback với IP address hiện tại
  const getTestCallbackUrl = () => {
    if (!orderId) return "";
    const origin = "http://192.168.1.8:5173";
    return `${origin}/payment/vietqr/${orderId}/test-callback`;
  };

  const testCallbackUrl = getTestCallbackUrl();

  // Auto check payment status
  useEffect(() => {
    if (!orderId || paymentStatus !== "pending") return;

    const checkPayment = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/payment/vietqr/check-payment`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token && { Authorization: `Bearer ${token}` }),
            },
            body: JSON.stringify({ order_id: parseInt(orderId) }),
          }
        );

        if (res.ok) {
          const data = await res.json();
          if (data.status !== "Pending") {
            setPaymentStatus("success");
            setTimeout(() => {
              navigate(`/result-order/${orderId}`);
            }, 2000);
          }
        }
      } catch (error) {
        console.error("Check payment error:", error);
      }
    };

    // Check ngay lập tức
    checkPayment();

    // Check mỗi 3 giây
    const interval = setInterval(checkPayment, 3000);
    return () => clearInterval(interval);
  }, [orderId, paymentStatus, token, navigate]);

  if (paymentStatus === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
          <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-700 mb-2">
            Thanh toán thành công!
          </h2>
          <p className="text-gray-600 mb-4">
            Đơn hàng của bạn đã được xác nhận thanh toán
          </p>
          <p className="text-sm text-gray-500">Đang chuyển hướng...</p>
        </div>
      </div>
    );
  }

  if (!orderId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <XCircle size={64} className="text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Không tìm thấy đơn hàng
          </h1>
          <button
            onClick={() => navigate("/")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6">
          Thanh toán qua QR Code
        </h1>

        {/* Test QR Code */}
        <div className="flex flex-col items-center mb-6">
          <div className="bg-white p-6 rounded-lg border-2 border-yellow-400 mb-4">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
                testCallbackUrl
              )}`}
              alt="Test QR Code"
              className="w-72 h-72"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
                  testCallbackUrl
                )}`;
              }}
            />
          </div>
          <p className="text-sm font-medium text-gray-700 text-center mb-2">
            Quét QR code này để test thanh toán
          </p>
          <p className="text-xs text-gray-500 text-center">
            (Không cần chuyển tiền thật)
          </p>
        </div>

        {/* URL Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-xs text-gray-600 mb-2">
            Hoặc mở link này trên điện thoại:
          </p>
          <div className="bg-white p-2 rounded border border-gray-300">
            <p className="text-xs text-gray-700 break-all font-mono text-center">
              {testCallbackUrl}
            </p>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold mb-2 text-blue-800">
            Hướng dẫn test:
          </h3>
          <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
            <li>Mở camera điện thoại</li>
            <li>Quét QR code phía trên</li>
            <li>Thanh toán sẽ được tự động xác nhận</li>
          </ol>
        </div>

        {/* Status indicator */}
        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
          <Loader2 className="animate-spin" size={16} />
          <span>Đang chờ thanh toán...</span>
        </div>

        <button
          onClick={() => navigate(`/result-order/${orderId}`)}
          className="mt-4 w-full text-sm text-gray-500 hover:text-gray-700 underline"
        >
          Xem chi tiết đơn hàng
        </button>
      </div>
    </div>
  );
};

export default VietQRPayment;
