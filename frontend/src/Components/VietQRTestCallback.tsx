import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CheckCircle, Loader2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const VietQRTestCallback = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();

  // Tự động detect API URL: nếu đang truy cập từ IP thì dùng IP cho API
  const getApiBase = () => {
    const envUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
    const currentHost = window.location.hostname;
    const currentPort = window.location.port || "5173";

    // Nếu đang truy cập từ IP address (không phải localhost)
    if (currentHost !== "localhost" && currentHost !== "127.0.0.1") {
      // Thay localhost trong API URL bằng IP hiện tại
      const apiUrl = envUrl.replace(/localhost|127\.0\.0\.1/, currentHost);
      // Đảm bảo port backend là 3000
      return apiUrl.replace(/:5173/, ":3000");
    }

    return envUrl;
  };

  const API_BASE = getApiBase();

  useEffect(() => {
    const simulatePayment = async () => {
      if (!orderId) {
        console.error("Missing orderId");
        return;
      }

      try {
        console.log(`TEST MODE: Simulating payment for order ${orderId}`);
        console.log(`API URL: ${API_BASE}/api/payment/vietqr/test-payment`);

        // Không cần token vì endpoint đã được mở (không cần auth)
        const res = await fetch(`${API_BASE}/api/payment/vietqr/test-payment`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Token không bắt buộc cho test endpoint
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({ order_id: parseInt(orderId) }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Không thể simulate payment");
        }

        const data = await res.json();

        if (data.success) {
          console.log("Test payment successful");
          // Redirect về trang kết quả sau 2 giây
          setTimeout(() => {
            navigate(`/result-order/${orderId}`);
          }, 2000);
        }
      } catch (error: any) {
        console.error("Test payment error:", error);
        alert(error.message || "Lỗi khi simulate payment");
        navigate(`/payment/vietqr/${orderId}`);
      }
    };

    simulatePayment();
  }, [orderId, navigate, API_BASE, token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full">
        <Loader2
          className="animate-spin text-blue-500 mx-auto mb-4"
          size={64}
        />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          TEST MODE - Đang xử lý...
        </h1>
        <p className="text-gray-600 mb-4">
          Đang giả lập quét QR code và chuyển khoản thành công
        </p>
        <p className="text-sm text-gray-500">Vui lòng đợi trong giây lát...</p>
      </div>
    </div>
  );
};

export default VietQRTestCallback;
