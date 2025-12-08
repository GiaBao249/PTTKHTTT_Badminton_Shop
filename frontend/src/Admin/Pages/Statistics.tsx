import { useState } from "react";
import {
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  Calendar,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  useRevenueStatistics,
  useProductStatistics,
  useOrderStatistics,
  useSummaryStatistics,
} from "../hook/useStatistics";

const Statistics = () => {
  const [revenuePeriod, setRevenuePeriod] = useState<
    "day" | "week" | "month" | "year"
  >("month");
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: new Date(new Date().setMonth(new Date().getMonth() - 1))
      .toISOString()
      .split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });
  const [showTopOnly, setShowTopOnly] = useState(false);
  const [topCount, setTopCount] = useState(20);
  const [tablePage, setTablePage] = useState(1);
  const [tablePageSize, setTablePageSize] = useState(10);
  const [chartType, setChartType] = useState<"bar" | "line">("bar");
  const [hoveredPieIndex, setHoveredPieIndex] = useState<number | null>(null);

  const { data: revenueStats, isLoading: revenueLoading } =
    useRevenueStatistics(revenuePeriod);
  const { data: productStats, isLoading: productLoading } =
    useProductStatistics();
  const { data: orderStats, isLoading: orderLoading } = useOrderStatistics();
  const { data: summaryStats, isLoading: summaryLoading } =
    useSummaryStatistics(dateRange.start, dateRange.end);

  const formatVND = (v: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(v);

  // Prepare revenue chart data
  const revenueChartData = revenueStats
    ? Object.entries(revenueStats.revenue)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([period, revenue]) => ({
          period,
          revenue,
          orders: revenueStats.orderCount[period] || 0,
        }))
    : [];

  // Convert status to Vietnamese
  const getStatusVietnamese = (status: string) => {
    switch (status) {
      case "Delivered":
        return "Đã giao";
      case "Shipped":
        return "Đang giao";
      case "Pending":
      case "Processing":
        return "Chờ xử lý";
      case "Cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  // Prepare order status chart data
  const orderStatusData = orderStats
    ? Object.entries(orderStats.statusCount).map(([status, count]) => ({
        status: getStatusVietnamese(status),
        originalStatus: status,
        count,
        revenue: orderStats.statusRevenue[status] || 0,
      }))
    : [];

  // Prepare data for recharts
  const getDisplayData = () => {
    let displayData = revenueChartData;

    if (showTopOnly && revenuePeriod === "day") {
      displayData = [...revenueChartData]
        .filter((d) => d.revenue > 0)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, topCount)
        .sort((a, b) => a.period.localeCompare(b.period));
    } else if (revenuePeriod === "day" && revenueChartData.length > 30) {
      displayData = revenueChartData.filter((d) => d.revenue > 0);
    }

    return displayData.map((item) => ({
      period:
        revenuePeriod === "day"
          ? new Date(item.period).toLocaleDateString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
            })
          : revenuePeriod === "week"
          ? (() => {
              const match = item.period.match(/^(\d{4})-W(\d{2})$/);
              if (match) {
                return `Tuần ${parseInt(match[2])}/${match[1]}`;
              }
              return `Tuần ${item.period}`;
            })()
          : revenuePeriod === "month"
          ? item.period.split("-")[1] + "/" + item.period.split("-")[0]
          : item.period,
      revenue: item.revenue,
      orders: item.orders,
      fullPeriod: item.period,
    }));
  };

  // Colors for pie chart
  const COLORS = [
    "#4F46E5",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#06B6D4",
    "#EC4899",
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Thống kê</h1>
          <p className="text-gray-600 mt-1">Phân tích dữ liệu và báo cáo</p>
        </div>
      </div>

      {/* Summary Cards */}
      {summaryLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="h-20 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Tổng doanh thu</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatVND(summaryStats?.totalRevenue || 0)}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {summaryStats?.completedOrders || 0} đơn hàng đã hoàn thành
                </p>
              </div>
              <div className="bg-green-500 p-3 rounded-lg">
                <DollarSign className="text-white" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Tổng đơn hàng</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(summaryStats?.totalOrders || 0).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Trong khoảng thời gian đã chọn
                </p>
              </div>
              <div className="bg-blue-500 p-3 rounded-lg">
                <ShoppingBag className="text-white" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Sản phẩm</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(summaryStats?.totalProducts || 0).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Tổng số sản phẩm trong hệ thống
                </p>
              </div>
              <div className="bg-purple-500 p-3 rounded-lg">
                <Package className="text-white" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Khách hàng</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(summaryStats?.totalCustomers || 0).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-2">Tổng số khách hàng</p>
              </div>
              <div className="bg-orange-500 p-3 rounded-lg">
                <Users className="text-white" size={24} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Date Range Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-4">
          <Calendar className="text-gray-500" size={20} />
          <div className="flex items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Từ ngày
              </label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange({ ...dateRange, start: e.target.value })
                }
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Đến ngày
              </label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange({ ...dateRange, end: e.target.value })
                }
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Doanh thu theo thời gian
          </h2>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex gap-2">
              {(["day", "week", "month", "year"] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setRevenuePeriod(period)}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    revenuePeriod === period
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {period === "day"
                    ? "Ngày"
                    : period === "week"
                    ? "Tuần"
                    : period === "month"
                    ? "Tháng"
                    : "Năm"}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setChartType("bar")}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  chartType === "bar"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Cột
              </button>
              <button
                onClick={() => setChartType("line")}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  chartType === "line"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Đường
              </button>
            </div>
            {revenuePeriod === "day" && revenueChartData.length > 20 && (
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showTopOnly}
                    onChange={(e) => setShowTopOnly(e.target.checked)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Hiển thị top</span>
                </label>
                {showTopOnly && (
                  <select
                    value={topCount}
                    onChange={(e) => setTopCount(Number(e.target.value))}
                    className="px-2 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={30}>30</option>
                    <option value={50}>50</option>
                  </select>
                )}
              </div>
            )}
          </div>
        </div>

        {revenueLoading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="text-gray-500">Đang tải dữ liệu...</div>
          </div>
        ) : !revenueStats || revenueChartData.length === 0 ? (
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-500 mb-2">Không có dữ liệu doanh thu</p>
              <p className="text-sm text-gray-400">
                Vui lòng kiểm tra lại dữ liệu đơn hàng
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Chart */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700">
                Biểu đồ doanh thu
              </h3>
              <div style={{ height: "400px", width: "100%" }}>
                {getDisplayData().length === 0 ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <p className="text-gray-400">
                      Không có doanh thu trong khoảng thời gian này
                    </p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    {chartType === "bar" ? (
                      <BarChart
                        data={getDisplayData()}
                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                          dataKey="period"
                          angle={-45}
                          textAnchor="end"
                          height={100}
                          tick={{ fontSize: 12 }}
                          interval={
                            getDisplayData().length > 30
                              ? Math.floor(getDisplayData().length / 15)
                              : 0
                          }
                        />
                        <YAxis
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) =>
                            `${(value / 1000000).toFixed(1)}M`
                          }
                        />
                        <Tooltip
                          formatter={(value: number) => [
                            formatVND(value),
                            "Doanh thu",
                          ]}
                          contentStyle={{
                            backgroundColor: "#1f2937",
                            border: "none",
                            borderRadius: "8px",
                            color: "#fff",
                          }}
                        />
                        <Legend />
                        <Bar
                          dataKey="revenue"
                          fill="#4F46E5"
                          radius={[8, 8, 0, 0]}
                          name="Doanh thu"
                        />
                      </BarChart>
                    ) : (
                      <LineChart
                        data={getDisplayData()}
                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                          dataKey="period"
                          angle={-45}
                          textAnchor="end"
                          height={100}
                          tick={{ fontSize: 12 }}
                          interval={
                            getDisplayData().length > 30
                              ? Math.floor(getDisplayData().length / 15)
                              : 0
                          }
                        />
                        <YAxis
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) =>
                            `${(value / 1000000).toFixed(1)}M`
                          }
                        />
                        <Tooltip
                          formatter={(value: number) => [
                            formatVND(value),
                            "Doanh thu",
                          ]}
                          contentStyle={{
                            backgroundColor: "#1f2937",
                            border: "none",
                            borderRadius: "8px",
                            color: "#fff",
                          }}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="revenue"
                          stroke="#4F46E5"
                          strokeWidth={3}
                          dot={{ fill: "#4F46E5", r: 4 }}
                          activeDot={{ r: 6 }}
                          name="Doanh thu"
                        />
                      </LineChart>
                    )}
                  </ResponsiveContainer>
                )}
              </div>
              {revenuePeriod === "day" && revenueChartData.length > 30 && (
                <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                  <p>
                    Đang hiển thị{" "}
                    {revenueChartData.filter((d) => d.revenue > 0).length} ngày
                    có doanh thu (tổng {revenueChartData.length} ngày)
                  </p>
                  <p className="text-indigo-600">
                    Hover vào biểu đồ để xem chi tiết
                  </p>
                </div>
              )}
            </div>

            {/* Table */}
            <div className="space-y-4">
              {/* Table Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <label className="text-sm text-gray-700">Hiển thị:</label>
                  <select
                    value={tablePageSize}
                    onChange={(e) => {
                      setTablePageSize(Number(e.target.value));
                      setTablePage(1);
                    }}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                    <option value={revenueChartData.length}>Tất cả</option>
                  </select>
                  <span className="text-sm text-gray-500">
                    Tổng: {revenueChartData.length}{" "}
                    {revenuePeriod === "day"
                      ? "ngày"
                      : revenuePeriod === "week"
                      ? "tuần"
                      : revenuePeriod === "month"
                      ? "tháng"
                      : "năm"}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  Trang {tablePage} /{" "}
                  {Math.ceil(revenueChartData.length / tablePageSize)}
                </div>
              </div>

              {/* Scrollable Table */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto max-h-96 overflow-y-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                          {revenuePeriod === "day"
                            ? "Ngày"
                            : revenuePeriod === "week"
                            ? "Tuần"
                            : revenuePeriod === "month"
                            ? "Tháng"
                            : "Năm"}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                          Số đơn hàng
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                          Doanh thu
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {revenueChartData
                        .slice(
                          (tablePage - 1) * tablePageSize,
                          tablePage * tablePageSize
                        )
                        .map((item) => (
                          <tr
                            key={item.period}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {revenuePeriod === "day"
                                ? new Date(item.period).toLocaleDateString(
                                    "vi-VN"
                                  )
                                : revenuePeriod === "week"
                                ? (() => {
                                    const match =
                                      item.period.match(/^(\d{4})-W(\d{2})$/);
                                    if (match) {
                                      return `Tuần ${parseInt(match[2])}/${
                                        match[1]
                                      }`;
                                    }
                                    return `Tuần ${item.period}`;
                                  })()
                                : revenuePeriod === "month"
                                ? item.period.split("-")[1] +
                                  "/" +
                                  item.period.split("-")[0]
                                : item.period}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.orders}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                              {formatVND(item.revenue)}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {revenueChartData.length > tablePageSize && (
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setTablePage((p) => Math.max(1, p - 1))}
                    disabled={tablePage === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Trước
                  </button>
                  <div className="flex items-center gap-2">
                    {Array.from(
                      {
                        length: Math.min(
                          5,
                          Math.ceil(revenueChartData.length / tablePageSize)
                        ),
                      },
                      (_, i) => {
                        const totalPages = Math.ceil(
                          revenueChartData.length / tablePageSize
                        );
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (tablePage <= 3) {
                          pageNum = i + 1;
                        } else if (tablePage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = tablePage - 2 + i;
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setTablePage(pageNum)}
                            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                              tablePage === pageNum
                                ? "bg-indigo-600 text-white"
                                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      }
                    )}
                  </div>
                  <button
                    onClick={() =>
                      setTablePage((p) =>
                        Math.min(
                          Math.ceil(revenueChartData.length / tablePageSize),
                          p + 1
                        )
                      )
                    }
                    disabled={
                      tablePage >=
                      Math.ceil(revenueChartData.length / tablePageSize)
                    }
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Sau
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Product Statistics */}
      {productLoading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="h-32 bg-gray-200 rounded animate-pulse" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Thống kê sản phẩm
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Tổng số sản phẩm</span>
                <span className="text-xl font-bold text-gray-900">
                  {productStats?.totalProducts || 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Tổng số lượng tồn kho</span>
                <span className="text-xl font-bold text-gray-900">
                  {(productStats?.totalQuantity || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <span className="text-gray-700">Sản phẩm còn hàng</span>
                <span className="text-xl font-bold text-green-600">
                  {productStats?.inStockProducts || 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                <span className="text-gray-700">Sản phẩm hết hàng</span>
                <span className="text-xl font-bold text-red-600">
                  {productStats?.outOfStockProducts || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Order Status Statistics */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Đơn hàng theo trạng thái
            </h2>
            {orderLoading ? (
              <div className="h-32 bg-gray-200 rounded animate-pulse" />
            ) : orderStatusData.length > 0 ? (
              <div className="space-y-6">
                {/* Pie Chart */}
                <div style={{ height: "300px", width: "100%" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={orderStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(props: any) => {
                          const {
                            cx,
                            cy,
                            midAngle,
                            innerRadius,
                            outerRadius,
                            percent,
                            payload,
                          } = props;
                          const RADIAN = Math.PI / 180;
                          const radius =
                            innerRadius + (outerRadius - innerRadius) * 0.5;
                          const x = cx + radius * Math.cos(-midAngle * RADIAN);
                          const y = cy + radius * Math.sin(-midAngle * RADIAN);
                          const index = orderStatusData.findIndex(
                            (d) => d.status === payload.status
                          );
                          const isHovered = hoveredPieIndex === index;

                          return (
                            <text
                              x={x}
                              y={y}
                              fill={isHovered ? "#ffffff" : "#374151"}
                              textAnchor={x > cx ? "start" : "end"}
                              dominantBaseline="central"
                              style={{
                                fontSize: "12px",
                                fontWeight: "500",
                                textShadow: isHovered
                                  ? "0 0 3px rgba(0,0,0,0.5)"
                                  : "none",
                              }}
                            >
                              {`${payload.status}: ${(percent * 100).toFixed(
                                0
                              )}%`}
                            </text>
                          );
                        }}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="status"
                      >
                        {orderStatusData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                            style={{
                              cursor: "pointer",
                            }}
                            onMouseEnter={() => setHoveredPieIndex(index)}
                            onMouseLeave={() => setHoveredPieIndex(null)}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(
                          value: number,
                          name: string,
                          props: any
                        ) => {
                          const status = props.payload?.status || name;
                          return [`${value} đơn hàng`, status];
                        }}
                        contentStyle={{
                          backgroundColor: "#ffffff",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          color: "#1f2937",
                          boxShadow:
                            "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                          padding: "12px 16px",
                        }}
                        labelStyle={{
                          color: "#1f2937",
                          fontWeight: "600",
                          marginBottom: "4px",
                        }}
                        itemStyle={{
                          color: "#374151",
                        }}
                      />
                      <Legend
                        formatter={(value, entry) => {
                          const payload = entry.payload as any;
                          return payload?.status || value;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* List */}
                <div className="space-y-3">
                  {orderStatusData.map((item, index) => (
                    <div
                      key={item.status}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded"
                          style={{
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        />
                        <div>
                          <p className="font-medium text-gray-900">
                            {item.status}
                          </p>
                          <p className="text-sm text-gray-500">
                            {item.count} đơn hàng
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {formatVND(item.revenue)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                Không có dữ liệu
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Statistics;
