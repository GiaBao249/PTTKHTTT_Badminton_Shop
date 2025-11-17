import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
type Step = 1 | 2 | 3 | 4;
import { toast } from "react-toastify";
type ShippingInfo = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  ward: string;
  postalCode: string;
};

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

const CheckOut = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const { subtotal = 0, cartItems = [] } =
    (location.state as {
      subtotal?: number;
      cartItems?: any[];
    }) || {};
  if (subtotal === 0) {
    navigate("/shoppingCart");
    return null;
  }
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    district: "",
    ward: "",
    postalCode: "",
  });
  const [shippingMethod, setShippingMethod] = useState<
    "freeShip" | "standard" | "express"
  >("standard");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "card">("cod");
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    null
  );
  const [loadingCustomer, setLoadingCustomer] = useState(false);
  const [useNewAddress, setUseNewAddress] = useState(false);
  const API_BASE = import.meta.env.VITE_API_URL;
  const handleCheckout = async () => {
    if (!user || !token) {
      toast.error("Vui lòng đăng nhập");
      return;
    }
    try {
      setLoading(true);
      const cartItemsData = cartItems.map((item) => ({
        product_item_id: item.product_item_id,
        quantity: item.quantity,
        total_amount: item.total_amount,
        price: item.product.price,
      }));
      const checkoutData: any = {
        cart_items: cartItemsData,
        shipping_method: shippingMethod,
        payment_method: paymentMethod,
        total_amount: total,
        shipping_cost: shippingCost,
      };

      if (selectedAddressId && !useNewAddress) {
        checkoutData.address_id = selectedAddressId;
      } else {
        checkoutData.shipping_info = {
          address: shippingInfo.address,
          ward: shippingInfo.ward || shippingInfo.district,
          district: shippingInfo.district,
          city: shippingInfo.city,
          postalCode: shippingInfo.postalCode,
        };
      }
      const res = await fetch(`${API_BASE}/api/checkout/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(checkoutData),
      });
      if (!res.ok) {
        // const errorData = await res.json();
        throw new Error("Đặt hàng thất bại");
      }
      const ans = await res.json();
      // toast.success("Đặt hàng thành công");
      // navigate(`/orders/${ans.order_id}`, { state: { order: ans } });
      navigate(`/result-order/${ans.order_id}`);
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast.error(error.message || "Lỗi khi đặt hàng");
    } finally {
      setLoading(false);
    }
  };
  const formatVND = (v: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(v);

  const shippingCost =
    shippingMethod === "freeShip"
      ? 0
      : shippingMethod === "standard"
      ? 20000
      : 50000;
  const total = subtotal + (currentStep >= 2 ? shippingCost : 0);

  useEffect(() => {
    if (subtotal >= 1000000) {
      setShippingMethod((prev) => {
        if (prev !== "freeShip") {
          return "freeShip";
        }
        return prev;
      });
    } else {
      setShippingMethod((prev) => {
        if (prev === "freeShip") {
          return "standard";
        }
        return prev;
      });
    }
  }, [subtotal]);
  const steps = [
    { number: 1, title: "Thông tin giao hàng" },
    { number: 2, title: "Phương thức vận chuyển" },
    { number: 3, title: "Thanh toán" },
    { number: 4, title: "Xem lại" },
  ];

  const handleInputChange = (field: keyof ShippingInfo, value: string) => {
    setShippingInfo((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    const fetchCustomerInfo = async () => {
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
        setCustomerInfo(data);

        setShippingInfo((prev) => ({
          ...prev,
          fullName: data.customer_name || prev.fullName,
          email: data.customer_email || prev.email,
          phone: data.customer_phone ? String(data.customer_phone) : prev.phone,
        }));

        if (data.address && data.address.length > 0) {
          const firstAddress = data.address[0];
          setSelectedAddressId(firstAddress.address_id);
          setUseNewAddress(false);
          setShippingInfo((prev) => ({
            ...prev,
            address: firstAddress.address_line || prev.address,
            ward: firstAddress.ward || prev.ward,
            district: firstAddress.district || prev.district,
            city: firstAddress.city || prev.city,
            postalCode: firstAddress.postal_code
              ? String(firstAddress.postal_code)
              : prev.postalCode,
          }));
        } else {
          setUseNewAddress(true);
        }
      } catch (error: any) {
        console.error("Error fetching customer info:", error);
        setUseNewAddress(true);
      } finally {
        setLoadingCustomer(false);
      }
    };

    fetchCustomerInfo();
  }, [user, token, API_BASE]);

  const handleAddressChange = (addressId: number | string) => {
    if (addressId === "new") {
      setUseNewAddress(true);
      setSelectedAddressId(null);
      return;
    }

    const address = customerInfo?.address?.find(
      (addr) => addr.address_id === Number(addressId)
    );
    if (address) {
      setSelectedAddressId(Number(addressId));
      setUseNewAddress(false);
      setShippingInfo((prev) => ({
        ...prev,
        address: address.address_line,
        ward: address.ward,
        district: address.district,
        city: address.city,
        postalCode: address.postal_code ? String(address.postal_code) : "",
      }));
    }
  };

  const canProceed = () => {
    if (currentStep === 1) {
      return Object.values(shippingInfo).every((val) => val.trim() !== "");
    }
    return true;
  };

  return (
    <section className="min-h-screen py-8">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">Thanh toán</h1>

        <div className="flex items-center justify-between mb-12">
          {steps.map((step, idx) => (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${
                    currentStep >= step.number
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {currentStep > step.number ? (
                    <Check size={20} />
                  ) : (
                    step.number
                  )}
                </div>
                <p
                  className={`mt-2 text-sm font-medium ${
                    currentStep >= step.number
                      ? "text-blue-600"
                      : "text-gray-500"
                  }`}
                >
                  {step.title}
                </p>
              </div>
              {idx < steps.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-4 transition-all ${
                    currentStep > step.number ? "bg-blue-600" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-[1fr_400px] gap-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Thông tin giao hàng</h2>

                {loadingCustomer ? (
                  <div className="text-sm text-gray-600">
                    Đang tải thông tin khách hàng...
                  </div>
                ) : (
                  customerInfo?.address &&
                  customerInfo.address.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Địa chỉ đã lưu
                      </label>
                      <select
                        value={
                          useNewAddress
                            ? "new"
                            : selectedAddressId?.toString() || ""
                        }
                        onChange={(e) => handleAddressChange(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="">-- Chọn địa chỉ --</option>
                        {customerInfo.address.map((addr) => (
                          <option key={addr.address_id} value={addr.address_id}>
                            {addr.address_line}, {addr.ward}, {addr.district},{" "}
                            {addr.city}
                          </option>
                        ))}
                        <option value="new">+ Nhập địa chỉ mới</option>
                      </select>
                    </div>
                  )
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    value={shippingInfo.fullName}
                    onChange={(e) =>
                      handleInputChange("fullName", e.target.value)
                    }
                    placeholder="Nguyễn Văn A"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    disabled={loadingCustomer}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={shippingInfo.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="ten@example.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    disabled={loadingCustomer}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={shippingInfo.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="0123 456 789"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    disabled={loadingCustomer}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Địa chỉ
                  </label>
                  <textarea
                    value={shippingInfo.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    placeholder="Số nhà, Đường, Phường/Xã"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                    disabled={
                      loadingCustomer ||
                      (!useNewAddress && selectedAddressId !== null)
                    }
                  />
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Thành phố
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.city}
                      onChange={(e) =>
                        handleInputChange("city", e.target.value)
                      }
                      placeholder="Hà Nội"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      disabled={
                        loadingCustomer ||
                        (!useNewAddress && selectedAddressId !== null)
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Quận/Huyện
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.district}
                      onChange={(e) =>
                        handleInputChange("district", e.target.value)
                      }
                      placeholder="Cầu Giấy"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      disabled={
                        loadingCustomer ||
                        (!useNewAddress && selectedAddressId !== null)
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Mã bưu chính
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.postalCode}
                      onChange={(e) =>
                        handleInputChange("postalCode", e.target.value)
                      }
                      placeholder="100000"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      disabled={
                        loadingCustomer ||
                        (!useNewAddress && selectedAddressId !== null)
                      }
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Phương thức vận chuyển</h2>
                {subtotal >= 1000000 && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      Bạn được miễn phí vận chuyển cho đơn hàng trên 1.000.000
                      VND!
                    </p>
                  </div>
                )}
                <div className="space-y-3">
                  <label
                    className={`flex items-center gap-4 p-4 border-2 rounded-lg transition-colors ${
                      shippingMethod === "freeShip"
                        ? "border-blue-500 bg-blue-50"
                        : subtotal < 1000000
                        ? "bg-gray-50 cursor-not-allowed opacity-50"
                        : "cursor-pointer hover:border-blue-500"
                    }`}
                  >
                    <input
                      type="radio"
                      name="shipping"
                      checked={shippingMethod === "freeShip"}
                      onChange={() => setShippingMethod("freeShip")}
                      className="w-4 h-4"
                      disabled={subtotal < 1000000}
                    />
                    <div className="flex-1">
                      <p className="font-medium">Miễn phí vận chuyển</p>
                      <p className="text-sm text-gray-500">2-3 ngày làm việc</p>
                      {subtotal >= 1000000 ? (
                        <p className="text-xs text-green-600 mt-1">
                          (Áp dụng tự động cho đơn hàng trên 1.000.000 VND)
                        </p>
                      ) : (
                        <p className="text-xs text-gray-500 mt-1">
                          (Áp dụng cho đơn hàng từ 1.000.000 VND)
                        </p>
                      )}
                    </div>
                    <p className="font-bold">{formatVND(0)}</p>
                  </label>
                  <label
                    className={`flex items-center gap-4 p-4 border-2 rounded-lg transition-colors ${
                      shippingMethod === "standard"
                        ? "border-blue-500 bg-blue-50"
                        : subtotal >= 1000000
                        ? "bg-gray-50 cursor-not-allowed opacity-50"
                        : "cursor-pointer hover:border-blue-500"
                    }`}
                  >
                    <input
                      type="radio"
                      name="shipping"
                      checked={shippingMethod === "standard"}
                      onChange={() => setShippingMethod("standard")}
                      className="w-4 h-4"
                      disabled={subtotal >= 1000000}
                    />
                    <div className="flex-1">
                      <p className="font-medium">Tiêu chuẩn</p>
                      <p className="text-sm text-gray-500">3-5 ngày làm việc</p>
                    </div>
                    <p className="font-bold">{formatVND(20000)}</p>
                  </label>
                  <label
                    className={`flex items-center gap-4 p-4 border-2 rounded-lg transition-colors ${
                      shippingMethod === "express"
                        ? "border-blue-500 bg-blue-50"
                        : subtotal >= 1000000
                        ? "bg-gray-50 cursor-not-allowed opacity-50"
                        : "cursor-pointer hover:border-blue-500"
                    }`}
                  >
                    <input
                      type="radio"
                      name="shipping"
                      checked={shippingMethod === "express"}
                      onChange={() => setShippingMethod("express")}
                      className="w-4 h-4"
                      disabled={subtotal >= 1000000}
                    />
                    <div className="flex-1">
                      <p className="font-medium">Hỏa tốc</p>
                      <p className="text-sm text-gray-500">1-2 ngày làm việc</p>
                    </div>
                    <p className="font-bold">{formatVND(50000)}</p>
                  </label>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Phương thức thanh toán</h2>
                <div className="space-y-3">
                  <label className="flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                      className="w-4 h-4"
                    />
                    <div className="flex-1">
                      <p className="font-medium">
                        Thanh toán khi nhận hàng (COD)
                      </p>
                      <p className="text-sm text-gray-500">
                        Thanh toán khi nhận
                      </p>
                    </div>
                  </label>
                  <label className="flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "card"}
                      onChange={() => setPaymentMethod("card")}
                      className="w-4 h-4"
                    />
                    <div className="flex-1">
                      <p className="font-medium">Thẻ ngân hàng</p>
                      <p className="text-sm text-gray-500">
                        MbBank, Vietcombank...
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Xem lại đơn hàng</h2>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-bold mb-2">Thông tin giao hàng</h3>
                    <p>{shippingInfo.fullName}</p>
                    <p>{shippingInfo.email}</p>
                    <p>{shippingInfo.phone}</p>
                    <p>{shippingInfo.address}</p>
                    <p>
                      {shippingInfo.city}, {shippingInfo.district},{" "}
                      {shippingInfo.postalCode}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-bold mb-2">Phương thức vận chuyển</h3>
                    <p>
                      {shippingMethod === "express"
                        ? "Hỏa tốc (1-2 ngày)"
                        : shippingMethod === "standard"
                        ? "Tiêu chuẩn (3-5 ngày)"
                        : "Miễn phí vận chuyển (2-3 ngày)"}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-bold mb-2">Phương thức thanh toán</h3>
                    <p>
                      {paymentMethod === "cod" &&
                        "Thanh toán khi nhận hàng (COD)"}
                      {paymentMethod === "card" && "Thẻ ngân hàng"}
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div className="flex justify-between mt-8">
              {currentStep > 1 && (
                <button
                  onClick={() => setCurrentStep((prev) => (prev - 1) as Step)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Quay lại
                </button>
              )}
              <button
                onClick={() => {
                  if (currentStep < 4) {
                    setCurrentStep((prev) => (prev + 1) as Step);
                  } else {
                    handleCheckout();
                  }
                }}
                disabled={!canProceed() || loading}
                className="ml-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? "Đang xử lý..."
                  : currentStep === 4
                  ? "Đặt hàng"
                  : "Tiếp tục"}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm h-fit sticky top-4">
            <h2 className="text-xl font-bold mb-4">Tóm tắt đơn hàng</h2>
            <div className="space-y-3 mb-4">
              <div className="flex justify-between">
                <span>Tạm tính</span>
                <span className="font-bold">{formatVND(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Phí vận chuyển</span>
                <span className="font-bold">
                  {currentStep >= 2 ? formatVND(shippingCost) : formatVND(0)}
                </span>
              </div>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between text-lg">
                <span className="font-bold">Tổng</span>
                <span className="font-bold">{formatVND(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CheckOut;
