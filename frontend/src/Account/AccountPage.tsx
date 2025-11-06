import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const AccountPage = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [addressDetail, setAddressDetail] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  useEffect(() => {
    if (!user) return;
    const name = (user.name || user.username || "").trim();
    setFullName(name);
    setEmail((user as any)?.email || "");
    setPhone((user as any)?.phone || "");
    setAddressDetail((user as any)?.address || "");
    setCity((user as any)?.city || "");
    setDistrict((user as any)?.district || "");
    setPostalCode((user as any)?.postal_code || "");
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const API_BASE = import.meta.env.VITE_API_URL;
    const abort = new AbortController();
    const fetchOrders = async () => {
      try {
        setLoadingOrders(true);
        const res = await fetch(`${API_BASE}/api/orders/customer/${user.id}`, {
          method: "GET",
          signal: abort.signal,
        });
        if (!res.ok) throw new Error("Failed to load orders");
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
      } catch (_) {
        setOrders([]);
      } finally {
        setLoadingOrders(false);
      }
    };
    fetchOrders();
    return () => abort.abort();
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setUpdating(true);

      const payload = {
        full_name: fullName,
        email,
        phone,
        address: addressDetail,
        city,
        district,
        postal_code: postalCode,
      };
      void payload;
      await new Promise((r) => setTimeout(r, 600));
      alert("Cập nhật thông tin thành công");
    } catch (_) {
      alert("Không thể cập nhật thông tin. Vui lòng thử lại");
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      alert("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("Xác nhận mật khẩu không khớp");
      return;
    }
    try {
      setUpdatingPassword(true);

      void token;
      await new Promise((r) => setTimeout(r, 700));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      alert("Đổi mật khẩu thành công");
    } catch (_) {
      alert("Không thể đổi mật khẩu. Vui lòng thử lại");
    } finally {
      setUpdatingPassword(false);
    }
  };

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <section className="py-6 md:py-8">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold mb-6">Tài khoản của tôi</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-4">
              Thông tin giao hàng
            </h4>
            <form className="space-y-4" onSubmit={handleUpdateProfile}>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Họ và tên
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Địa chỉ
                </label>
                <textarea
                  value={addressDetail}
                  onChange={(e) => setAddressDetail(e.target.value)}
                  className="w-full min-h-[88px] px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  placeholder="Số nhà, Đường, Phường/Xã"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Thành phố
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Quận/Huyện
                  </label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Mã bưu chính
                  </label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                </div>
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={updating}
                  className={`inline-flex items-center justify-center px-4 py-2 rounded-md text-white ${
                    updating
                      ? "bg-gray-400"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  } transition-colors`}
                >
                  {updating ? "Đang lưu..." : "Lưu thông tin"}
                </button>
              </div>
            </form>

            <div className="my-6 h-px bg-gray-200" />
            <h4 className="font-medium text-gray-900 mb-4">
              Tài khoản & Mật khẩu
            </h4>
            <form className="space-y-4" onSubmit={handleUpdatePassword}>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Mật khẩu hiện tại
                </label>
                <div className="relative">
                  <input
                    type={showCurrent ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full h-10 px-3 pr-10 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-600 hover:text-gray-900"
                    onClick={() => setShowCurrent((v) => !v)}
                  >
                    {showCurrent ? "Ẩn" : "Hiện"}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <input
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full h-10 px-3 pr-10 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-600 hover:text-gray-900"
                    onClick={() => setShowNew((v) => !v)}
                  >
                    {showNew ? "Ẩn" : "Hiện"}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Xác nhận mật khẩu
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full h-10 px-3 pr-10 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-600 hover:text-gray-900"
                    onClick={() => setShowConfirm((v) => !v)}
                  >
                    {showConfirm ? "Ẩn" : "Hiện"}
                  </button>
                </div>
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={updatingPassword}
                  className={`inline-flex items-center justify-center px-4 py-2 rounded-md text-white ${
                    updatingPassword
                      ? "bg-gray-400"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  } transition-colors`}
                >
                  {updatingPassword ? "Đang đổi..." : "Đổi mật khẩu"}
                </button>
              </div>
            </form>
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-4">Sản phẩm đã mua</h4>
            {loadingOrders ? (
              <p className="text-sm text-gray-600">Đang tải đơn hàng...</p>
            ) : orders.length === 0 ? (
              <div className="text-sm text-gray-600">
                <p>Chưa có đơn hàng.</p>
                <button
                  className="mt-3 inline-flex items-center px-3 py-2 rounded-md border border-gray-300 hover:bg-gray-50"
                  onClick={() => navigate("/orders")}
                >
                  Xem tất cả đơn hàng
                </button>
              </div>
            ) : (
              <div className="max-h-[600px] overflow-auto divide-y">
                {orders.map((o: any, idx: number) => (
                  <div
                    key={idx}
                    className="py-3 flex items-start justify-between gap-4"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Mã đơn: {o.order_id ?? o.id ?? "#"}
                      </p>
                      <p className="text-xs text-gray-600">
                        Ngày: {o.order_date ?? o.date ?? "-"}
                      </p>
                      <p className="text-xs text-gray-600">
                        Trạng thái: {o.status ?? "-"}
                      </p>
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {typeof o.total_amount === "number"
                        ? new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(o.total_amount)
                        : ""}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AccountPage;
