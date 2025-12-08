import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";
import { animateScrollToTop } from "../utils/scroll/animateScrollToTop";
import { X, Download } from "lucide-react";
import { PDFDownloadLink, Font } from "@react-pdf/renderer";
import { InvoicePDFDocument } from "../Components/InvoicePDF";
import { useQuery } from "@tanstack/react-query";
import BeVietnamRegular from "../assets/fonts/Be_Vietnam_Pro/BeVietnamPro-Regular.ttf?url";
import BeVietnamSemiBold from "../assets/fonts/Be_Vietnam_Pro/BeVietnamPro-SemiBold.ttf?url";
import BeVietnamBold from "../assets/fonts/Be_Vietnam_Pro/BeVietnamPro-Bold.ttf?url";

Font.register({
  family: "BeVietnamPro",
  fonts: [
    { src: BeVietnamRegular, fontWeight: "normal" },
    { src: BeVietnamSemiBold, fontWeight: 600 },
    { src: BeVietnamBold, fontWeight: 700 },
  ],
});
type CustomerAddress = {
  address_id: number;
  address_line: string;
  ward: string;
  district: string;
  city: string;
  postal_code: string;
};

type CustomerInfo = {
  customer_id: number;
  customer_name: string;
  customer_gender: string;
  customer_phone: string;
  customer_email: string;
  address: CustomerAddress[];
};
type OrderDetail = {
  order_id: number;
  product_item_id: number;
  quantity: number;
  product: {
    product_item_id: number;
    product_id: number;
    product: {
      product_id: number;
      product_name: string;
      category: {
        category_id: number;
        category_name: string;
      } | null;
    } | null;
  } | null;
} | null;
type Order = {
  order_id: number;
  status: string;
  total_amount: number;
  order_date: string;
  delivery_date: string | null;
  address_id: number;
  customer_id: number;
  order_detail: OrderDetail[];
  infoProduct: OrderDetail[];
};

const API_BASE = import.meta.env.VITE_API_URL;
const AccountPage = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedOrders, setExpandedOrders] = useState<Set<number>>(new Set());
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [openCancelConfirm, setOpenCancelConfirm] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [isCanceling, setIsCanceling] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loadingCustomer, setLoadingCustomer] = useState(false);
  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    null
  );
  const [addressLine, setAddressLine] = useState("");
  const [ward, setWard] = useState("");
  const [district, setDistrict] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [isUpdatingAddress, setIsUpdatingAddress] = useState(false);
  const fetchCustomer = async () => {
    if (!user || !token) return;
    try {
      setLoadingCustomer(true);
      const res = await fetch(`${API_BASE}/api/info/${user.id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        throw new Error("Không load được thông tin khách hàng");
      }
      const data = (await res.json()) as CustomerInfo;
      // console.log(data);
      const mappedAddresses: CustomerAddress[] = (data.address || []).map(
        (addr) => ({
          address_id: Number(addr.address_id),
          address_line: addr.address_line ?? "",
          ward: addr.ward ?? "",
          district: addr.district ?? "",
          city: addr.city ?? "",
          postal_code: addr.postal_code ? String(addr.postal_code) : "",
        })
      );

      setFullName(data.customer_name ?? "");
      setGender(data.customer_gender ?? "");
      const phoneFromDB = data.customer_phone
        ? String(data.customer_phone)
        : "";
      setPhone(phoneFromDB);
      setEmail(data.customer_email ?? "");
      setAddresses(mappedAddresses);

      if (mappedAddresses.length > 0) {
        const first = mappedAddresses[0];
        setSelectedAddressId(first.address_id);
        setAddressLine(first.address_line);
        setWard(first.ward);
        setDistrict(first.district);
        setCity(first.city);
        setPostalCode(first.postal_code);
      } else {
        setSelectedAddressId(null);
        setAddressLine("");
        setWard("");
        setDistrict("");
        setCity("");
        setPostalCode("");
      }
    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.error("Lỗi khi xử lí với khách hàng", error);
      }
    } finally {
      setLoadingCustomer(false);
    }
  };
  useEffect(() => {
    if (!user || !token) return;
    const abort = new AbortController();
    fetchCustomer();
    return () => abort.abort();
  }, [user, token]);

  useEffect(() => {
    if (!selectedAddressId) return;
    const current = addresses.find(
      (addr) => addr.address_id === selectedAddressId
    );
    if (!current) return;
    setAddressLine(current.address_line);
    setWard(current.ward);
    setDistrict(current.district);
    setCity(current.city);
    setPostalCode(current.postal_code);
  }, [selectedAddressId, addresses]);

  useEffect(() => {
    if (!user || !token) return;
    const abort = new AbortController();
    const fetchOrders = async () => {
      try {
        setLoadingOrders(true);
        const res = await fetch(`${API_BASE}/api/orders/customer/${user.id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: abort.signal,
        });
        if (!res.ok) throw new Error("Failed to load orders");
        const data = await res.json();
        // console.log("Orders data:", data);
        setOrders(Array.isArray(data) ? data : []);
      } catch (error: any) {
        //console.error("Error fetching orders:", error);
        // toast.error(error.message || "Không thể tải đơn hàng");
        setOrders([]);
      } finally {
        setLoadingOrders(false);
      }
    };
    fetchOrders();
    return () => abort.abort();
  }, [user, token]);

  if (!user) {
    navigate("/login");
    return null;
  }

  const handleUpdateInformationCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let phoneToSend = phone.trim();
      if (phoneToSend.startsWith("00")) {
        phoneToSend = phoneToSend.substring(1);
      }
      if (phoneToSend && !phoneToSend.startsWith("0")) {
        phoneToSend = "0" + phoneToSend;
      }

      const res = await fetch(`${API_BASE}/api/info/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          customer_name: fullName.trim(),
          customer_phone: phoneToSend,
          customer_gender: gender,
          customer_email: email.trim(),
        }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        toast.error(errorData.error || "Lỗi không cập nhật được thông tin");
        return;
      }
      toast.success("Cập nhật thông tin thành công!");
      animateScrollToTop(window, 700);
      await fetchCustomer();
    } catch (error: any) {
      toast.error("Lỗi khi cập nhật thông tin");
    }
  };

  const handleUpdatePasswordCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu mới và xác nhận mật khẩu không khớp");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/info/${user.id}/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        toast.error(errorData.error || "Lỗi không cập nhật được mật khẩu");
        return;
      }
      toast.success("Đổi mật khẩu thành công!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      await fetchCustomer();
    } catch (error: any) {
      toast.error("Lỗi khi đổi mật khẩu");
    }
  };

  const handleAddNewAddress = () => {
    setIsAddingNewAddress(true);
    setSelectedAddressId(null);
    setAddressLine("");
    setWard("");
    setDistrict("");
    setCity("");
    setPostalCode("");
  };

  const handleCancelAddAddress = () => {
    setIsAddingNewAddress(false);
    if (addresses.length > 0) {
      const first = addresses[0];
      setSelectedAddressId(first.address_id);
      setAddressLine(first.address_line);
      setWard(first.ward);
      setDistrict(first.district);
      setCity(first.city);
      setPostalCode(first.postal_code);
    }
  };

  const handleSaveAddress = async () => {
    if (!addressLine || !ward || !district || !city) {
      toast.error("Vui lòng điền đầy đủ thông tin địa chỉ");
      return;
    }
    setIsUpdatingAddress(true);
    try {
      if (isAddingNewAddress) {
        const res = await fetch(`${API_BASE}/api/info/${user.id}/address`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            address_line: addressLine,
            ward,
            district,
            city,
            postal_code: postalCode,
          }),
        });
        if (!res.ok) {
          const errorData = await res.json();
          toast.error(errorData.error || "Lỗi không thêm được địa chỉ");
          return;
        }
        toast.success("Thêm địa chỉ thành công!");
        setIsAddingNewAddress(false);
        animateScrollToTop(window, 700);
        await fetchCustomer();
      } else if (selectedAddressId) {
        const res = await fetch(
          `${API_BASE}/api/info/${user.id}/address/${selectedAddressId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              address_line: addressLine,
              ward,
              district,
              city,
              postal_code: postalCode,
            }),
          }
        );
        if (!res.ok) {
          const errorData = await res.json();
          toast.error(errorData.error || "Lỗi không cập nhật được địa chỉ");
          return;
        }
        toast.success("Cập nhật địa chỉ thành công!");
        animateScrollToTop(window, 700);
        await fetchCustomer();
      }
    } catch (error: any) {
      toast.error("Lỗi khi lưu địa chỉ");
    } finally {
      setIsUpdatingAddress(false);
    }
  };

  const toggleOrder = (orderId: number) => {
    setExpandedOrders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch (error) {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
      case "processing":
      case "đang chờ":
      case "chờ xử lý":
        return "bg-yellow-100 text-yellow-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "shipped":
      case "hoàn thành":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
      case "đã hủy":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: "Chờ xử lý",
      delivered: "Đã giao",
      shipped: "Đang giao",
      completed: "Hoàn thành",
      cancelled: "Đã hủy",
      processing: "Chờ xử lý",
    };

    return statusMap[status?.toLowerCase() || ""] || status || "Chưa xác định";
  };

  const handleCancelClick = (orderId: number) => {
    setSelectedOrderId(orderId);
    setOpenCancelConfirm(true);
  };

  const CustomerInvoiceButton = ({ orderId }: { orderId: number }) => {
    const API_BASE = import.meta.env.VITE_API_URL;
    const { token } = useAuth();

    const { data: invoice, isLoading } = useQuery({
      queryKey: ["invoice", orderId],
      queryFn: async () => {
        const res = await fetch(`${API_BASE}/api/admin/getInvoice/${orderId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch invoice");
        return res.json();
      },
      enabled: !!orderId && !!token,
    });

    if (isLoading || !invoice) {
      return null;
    }

    return (
      <PDFDownloadLink
        document={<InvoicePDFDocument invoice={invoice} />}
        fileName={`hoa-don-${orderId}.pdf`}
        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
      >
        {({ loading }) =>
          loading ? (
            "Đang tạo PDF..."
          ) : (
            <>
              <Download size={16} />
              Tải hóa đơn
            </>
          )
        }
      </PDFDownloadLink>
    );
  };

  const handleCancelConfirm = async () => {
    if (!selectedOrderId || !token) return;

    setIsCanceling(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/orders/cancel/${selectedOrderId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Không thể hủy đơn hàng");
      }

      const data = await res.json();
      toast.success(data.message || "Hủy đơn hàng thành công");

      // Refresh orders list
      const fetchOrders = async () => {
        try {
          const res = await fetch(
            `${API_BASE}/api/orders/customer/${user.id}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (res.ok) {
            const data = await res.json();
            setOrders(Array.isArray(data) ? data : []);
          }
        } catch (error) {
          console.error("Error refreshing orders:", error);
        }
      };
      fetchOrders();

      setOpenCancelConfirm(false);
      setSelectedOrderId(null);
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi hủy đơn hàng");
      console.error("Error canceling order:", error);
    } finally {
      setIsCanceling(false);
    }
  };

  return (
    <section className="py-6 md:py-8">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold mb-6">Tài khoản của tôi</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-4">
              Thông tin giao hàng
            </h4>
            {loadingCustomer ? (
              <p className="text-sm text-gray-600">
                Đang tải thông tin khách hàng...
              </p>
            ) : (
              <form
                className="space-y-4"
                onSubmit={handleUpdateInformationCustomer}
              >
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
                    Giới tính
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
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
                    onChange={(e) => {
                      let value = e.target.value;
                      if (value && !value.startsWith("0")) {
                        value = "0" + value;
                      }
                      if (value.length > 11) {
                        value = value.substring(0, 11);
                      }
                      setPhone(value);
                    }}
                    placeholder="0123456789"
                    className="w-full h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm text-gray-600">
                      Địa chỉ đã lưu
                    </label>
                    <button
                      type="button"
                      onClick={handleAddNewAddress}
                      className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      + Thêm địa chỉ mới
                    </button>
                  </div>
                  {!isAddingNewAddress ? (
                    <select
                      value={selectedAddressId ?? ""}
                      onChange={(e) =>
                        setSelectedAddressId(
                          e.target.value ? Number(e.target.value) : null
                        )
                      }
                      className="w-full h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    >
                      {addresses.length === 0 ? (
                        <option value="">Chưa có địa chỉ</option>
                      ) : (
                        addresses.map((addr) => (
                          <option key={addr.address_id} value={addr.address_id}>
                            {addr.address_line}, {addr.ward}, {addr.district},{" "}
                            {addr.city}
                          </option>
                        ))
                      )}
                    </select>
                  ) : (
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm text-blue-800">
                      Đang thêm địa chỉ mới
                      <button
                        type="button"
                        onClick={handleCancelAddAddress}
                        className="ml-2 text-blue-600 hover:text-blue-800 underline"
                      >
                        Hủy
                      </button>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Địa chỉ
                  </label>
                  <textarea
                    value={addressLine}
                    onChange={(e) => setAddressLine(e.target.value)}
                    className="w-full min-h-[88px] px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    placeholder="Số nhà, Đường, Phường/Xã"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Phường/Xã
                  </label>
                  <input
                    type="text"
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
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
                <div className="pt-2 flex gap-2">
                  <button
                    type="submit"
                    disabled={loadingCustomer}
                    className={`inline-flex items-center justify-center px-4 py-2 rounded-md text-white ${
                      loadingCustomer
                        ? "bg-gray-400"
                        : "bg-indigo-600 hover:bg-indigo-700"
                    } transition-colors`}
                  >
                    {loadingCustomer ? "Đang tải dữ liệu..." : "Lưu thông tin"}
                  </button>
                  {(selectedAddressId || isAddingNewAddress) && (
                    <button
                      type="button"
                      onClick={handleSaveAddress}
                      disabled={isUpdatingAddress || loadingCustomer}
                      className={`inline-flex items-center justify-center px-4 py-2 rounded-md text-white ${
                        isUpdatingAddress || loadingCustomer
                          ? "bg-gray-400"
                          : "bg-green-600 hover:bg-green-700"
                      } transition-colors`}
                    >
                      {isUpdatingAddress
                        ? "Đang lưu..."
                        : isAddingNewAddress
                        ? "Lưu địa chỉ mới"
                        : "Lưu địa chỉ"}
                    </button>
                  )}
                </div>
              </form>
            )}

            <div className="my-6 h-px bg-gray-200" />
            <h4 className="font-medium text-gray-900 mb-4">
              Tài khoản & Mật khẩu
            </h4>
            <form className="space-y-4" onSubmit={handleUpdatePasswordCustomer}>
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
                  disabled={loadingCustomer}
                  className={`inline-flex items-center justify-center px-4 py-2 rounded-md text-white ${
                    loadingCustomer
                      ? "bg-gray-400"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  } transition-colors`}
                >
                  {loadingCustomer ? "Vui lòng đợi..." : "Đổi mật khẩu"}
                </button>
              </div>
            </form>
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-4">Đơn hàng của tôi</h4>
            {loadingOrders ? (
              <p className="text-sm text-gray-600">Đang tải đơn hàng...</p>
            ) : orders.length === 0 ? (
              <div className="text-sm text-gray-600">
                <p>Chưa có đơn hàng.</p>
                <button
                  className="mt-3 inline-flex items-center px-3 py-2 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
                  onClick={() => navigate("/orders")}
                >
                  Xem tất cả đơn hàng
                </button>
              </div>
            ) : (
              <div className="space-y-3 max-h-full overflow-y-auto">
                {orders.map((order) => {
                  const isExpanded = expandedOrders.has(order.order_id);
                  return (
                    <div
                      key={order.order_id}
                      className="border border-gray-200 rounded-lg overflow-hidden transition-all duration-200 hover:shadow-md"
                    >
                      <button
                        type="button"
                        onClick={() => toggleOrder(order.order_id)}
                        className="w-full px-4 py-3 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-sm font-semibold text-gray-900">
                              Mã đơn: #{order.order_id}
                            </span>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                                order.status
                              )}`}
                            >
                              {getStatusText(order.status) || "Chưa xác định"}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
                            <span>
                              Ngày đặt: {formatDate(order.order_date)}
                            </span>
                            {order.delivery_date && (
                              <span>
                                Ngày giao: {formatDate(order.delivery_date)}
                              </span>
                            )}
                            <span className="font-semibold text-gray-900">
                              {typeof order.total_amount === "number"
                                ? new Intl.NumberFormat("vi-VN", {
                                    style: "currency",
                                    currency: "VND",
                                  }).format(order.total_amount)
                                : "-"}
                            </span>
                          </div>
                        </div>
                        <svg
                          className={`w-5 h-5 text-gray-500 transition-transform duration-200 flex-shrink-0 ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                      <div
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${
                          isExpanded
                            ? "max-h-[500px] opacity-100"
                            : "max-h-0 opacity-0"
                        }`}
                      >
                        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                          {order.infoProduct && order.infoProduct.length > 0 ? (
                            <div className="space-y-3">
                              <h5 className="text-sm font-semibold text-gray-900 mb-3">
                                Chi tiết đơn hàng ({order.infoProduct.length}{" "}
                                sản phẩm)
                              </h5>

                              <div className="space-y-2">
                                {order.infoProduct.map((item, index) => (
                                  <div
                                    key={`${item?.product_item_id}-${index}`}
                                    className="bg-white rounded-md p-3 border border-gray-200"
                                  >
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                      <div className="flex-1">
                                        <div className="flex items-start gap-3">
                                          <div className="flex-1">
                                            <h6 className="font-medium text-gray-900 text-sm mb-1">
                                              {item?.product?.product
                                                ?.product_name ||
                                                "Sản phẩm không xác định"}
                                            </h6>
                                            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                                              {item?.product?.product
                                                ?.category && (
                                                <span className="px-2 py-1 bg-gray-100 rounded">
                                                  {
                                                    item.product.product
                                                      .category.category_name
                                                  }
                                                </span>
                                              )}
                                              <span>
                                                Mã SP: #{item?.product_item_id}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-4 text-sm">
                                        <div className="text-right">
                                          <div className="text-gray-600 text-xs">
                                            Số lượng
                                          </div>
                                          <div className="font-semibold text-gray-900">
                                            {item?.quantity || 0}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              <div className="pt-3 border-t border-gray-200">
                                <div className="flex justify-between items-center mb-3">
                                  <span className="text-sm font-medium text-gray-700">
                                    Tổng tiền:
                                  </span>
                                  <span className="font-bold text-lg text-indigo-600">
                                    {typeof order.total_amount === "number"
                                      ? new Intl.NumberFormat("vi-VN", {
                                          style: "currency",
                                          currency: "VND",
                                        }).format(order.total_amount)
                                      : "-"}
                                  </span>
                                </div>
                                {/* Nút hủy đơn hàng và in hóa đơn */}
                                <div className="flex justify-end gap-2">
                                  {(order.status === "Pending" ||
                                    order.status === "Processing") && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCancelClick(order.order_id);
                                      }}
                                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                                    >
                                      <X size={16} />
                                      Hủy đơn hàng
                                    </button>
                                  )}
                                  {(order.status === "Delivered" ||
                                    order.status === "Completed") && (
                                    <CustomerInvoiceButton
                                      orderId={order.order_id}
                                    />
                                  )}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500 text-center py-2">
                              Không có chi tiết đơn hàng
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dialog xác nhận hủy đơn hàng */}
      {openCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Xác nhận hủy đơn hàng
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Bạn có chắc chắn muốn hủy đơn hàng #{selectedOrderId}? Hành động
                này không thể hoàn tác và số lượng sản phẩm sẽ được trả lại vào
                kho.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setOpenCancelConfirm(false);
                    setSelectedOrderId(null);
                  }}
                  disabled={isCanceling}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleCancelConfirm}
                  disabled={isCanceling}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isCanceling ? "Đang xử lý..." : "Xác nhận hủy"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default AccountPage;
