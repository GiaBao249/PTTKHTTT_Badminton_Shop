import { useEffect, useState, createContext, useContext } from "react";
import { ShoppingBag, Users, Package, TrendingUp } from "lucide-react";
import { useProducts } from "../hook/useProducts";
import { useOrders } from "../hook/useOrders";
import { useProductItems } from "../hook/useProductItems";
import { useCustomers } from "../hook/useCustomers";
import { useRecentOrders } from "../hook/useRecentOrders";
import { useDashBoard } from "../hook/useDashBoard";
import { useTopSellingProducts } from "../hook/useTopSellingProducts";

const Dashboard = () => {
  const stats = useDashBoard().data || {
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    totalRevenue: 0,
  };
  const [loading, setLoading] = useState(true);

  const recentOrders = useRecentOrders().data || [];
  const customers = useCustomers().data || [];
  const { data: topSellingProducts, isLoading: isLoadingTopProducts } =
    useTopSellingProducts(5);

  useEffect(() => {
    if (stats && recentOrders && customers) {
      setLoading(false);
    }
  }, [stats, recentOrders, customers]);

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
      value: formatVND(stats.totalRevenue),
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
                  <p className="text-sm text-gray-500">
                    Khách hàng{" "}
                    {
                      customers.find(
                        (c) => Number(c.customer_id) === Number(i.customer_id)
                      )?.customer_name
                    }
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {formatVND(i.total_amount)}
                  </p>
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
          {isLoadingTopProducts ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse" />
                    <div>
                      <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-2" />
                      <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : topSellingProducts && topSellingProducts.length > 0 ? (
            <div className="space-y-3">
              {topSellingProducts.map((product) => (
                <div
                  key={product.product_id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center">
                      {product.thumbnail ? (
                        <img
                          src={product.thumbnail}
                          alt={product.product_name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <Package size={20} className="text-gray-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {product.product_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {product.sold_quantity.toLocaleString()} đã bán
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold text-indigo-600">
                    {formatVND(product.price)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">
              Chưa có sản phẩm bán chạy
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
