import { useEffect, useState } from "react";
import { ShoppingBag, Users, Package, TrendingUp } from "lucide-react";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(true);
  interface Order {
    order_id: number;
    customer_id: number;
    status: string;
    total_amount: number;
    order_date: number;
    delivery_date: number;
    address_id: string;
  }

  interface Customer {
    customer_id: number;
    customer_name: string;
    customer_gender: string;
    customer_phone: string;
    customer_email: string;
  }

  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const API_BASE = import.meta.env.VITE_API_URL;
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Lấy cả khách hàng và đơn hàng gần đây cùng lúc
        const [customersRes, ordersRes, statsRes] = await Promise.all([
          fetch(`${API_BASE}/api/admin/customer`).then(res => res.json()),
          fetch(`${API_BASE}/api/admin/recent_orders`).then(res => res.json()),
          fetch(`${API_BASE}/api/admin/dashboard`).then(res => res.json()),
        ]);

        setCustomers(customersRes);
        setRecentOrders(
          ordersRes
            .map((o: any) => ({ ...o, customer_id: Number(o.customer_id) })) // ép kiểu customer_id về number
            .sort((a: any, b: any) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime()) // sort theo ngày giảm dần
            .slice(0, 5)
        );
        setStats(statsRes);
      } catch (err) {
        console.error("Lỗi khi fetch dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatVND = (v: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(v);

  const statCards = [
    {
      title: "Tổng đơn hàng",
      value: stats.totalOrders.toLocaleString(),
      icon: ShoppingBag,
      color: "bg-blue-500",
      change: "+12.5%",
    },
    {
      title: "Khách hàng",
      value: stats.totalCustomers.toLocaleString(),
      icon: Users,
      color: "bg-green-500",
      change: "+8.2%",
    },
    {
      title: "Sản phẩm",
      value: stats.totalProducts.toLocaleString(),
      icon: Package,
      color: "bg-purple-500",
      change: "+5.1%",
    },
    {
      title: "Doanh thu",
      value: formatVND(stats.revenue),
      icon: TrendingUp,
      color: "bg-orange-500",
      change: "+15.3%",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tổng quan</h1>
        <p className="text-gray-600 mt-1">Chào mừng trở lại bảng điều khiển</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{card.title}</p>
                  {loading ? (
                    <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
                  ) : (
                    <p className="text-2xl font-bold text-gray-900">
                      {card.value}
                    </p>
                  )}
                  <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                    <TrendingUp size={12} />
                    {card.change} so với tháng trước
                  </p>
                </div>
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Đơn hàng gần đây
          </h2>
          <div className="space-y-3">
            {recentOrders.map((i) => (
              <div
                key={i.order_id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    Đơn hàng #{i.order_id}
                  </p>
                  <p className="text-sm text-gray-500">Khách hàng {customers.find(c => Number(c.customer_id) === Number(i.customer_id))?.customer_name}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{formatVND(i.total_amount)}</p>
                  <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                    {i.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Sản phẩm bán chạy
          </h2>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg" />
                  <div>
                    <p className="font-medium text-gray-900">Sản phẩm {i}</p>
                    <p className="text-sm text-gray-500">
                      {50 + i * 10} đã bán
                    </p>
                  </div>
                </div>
                <p className="font-semibold text-indigo-600">
                  {formatVND((500000 + i * 100000) / 100)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;