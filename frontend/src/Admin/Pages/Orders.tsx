import { useState } from "react";
import { Search, Eye, Edit2, X } from "lucide-react";
import {
  DialogViewDetails,
  DialogStatusUpdate,
  DialogDeleteConfirm,
} from "../Components";

const Orders = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [openViewDetails, setOpenViewDetails] = useState(false);
  const [openStatusUpdate, setOpenStatusUpdate] = useState(false);
  const [openCancelConfirm, setOpenCancelConfirm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<{
    id: number;
    customer: string;
    date: string;
    total: number;
    status: string;
    items: number;
  } | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [orders, setOrders] = useState([
    {
      id: 1001,
      customer: "Nguyễn Văn A",
      date: "2024-01-15",
      total: 2500000,
      status: "Đã giao",
      items: 3,
    },
    {
      id: 1002,
      customer: "Trần Thị B",
      date: "2024-01-14",
      total: 1800000,
      status: "Đang giao",
      items: 2,
    },
    {
      id: 1003,
      customer: "Lê Văn C",
      date: "2024-01-13",
      total: 3200000,
      status: "Chờ xử lý",
      items: 5,
    },
    {
      id: 1004,
      customer: "Phạm Thị D",
      date: "2024-01-12",
      total: 950000,
      status: "Đã hủy",
      items: 1,
    },
  ]);

  const formatVND = (v: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(v);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Đã giao":
        return "bg-green-100 text-green-700";
      case "Đang giao":
        return "bg-blue-100 text-blue-700";
      case "Chờ xử lý":
        return "bg-yellow-100 text-yellow-700";
      case "Đã hủy":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toString().includes(searchTerm);
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleViewDetails = (order: (typeof orders)[0]) => {
    setSelectedOrder(order);
    setOpenViewDetails(true);
  };

  const handleStatusUpdate = (order: (typeof orders)[0]) => {
    setSelectedOrder(order);
    setOpenStatusUpdate(true);
  };

  const handleStatusConfirm = async () => {
    if (!selectedOrder) return;
    setIsUpdating(true);
    // TODO: Gọi API cập nhật trạng thái
    const nextStatus =
      selectedOrder.status === "Chờ xử lý"
        ? "Đang giao"
        : selectedOrder.status === "Đang giao"
        ? "Đã giao"
        : "Đã giao";
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setOrders(
      orders.map((o) =>
        o.id === selectedOrder.id ? { ...o, status: nextStatus } : o
      )
    );
    setIsUpdating(false);
    setOpenStatusUpdate(false);
    setSelectedOrder(null);
  };

  const handleCancelClick = (order: (typeof orders)[0]) => {
    setSelectedOrder(order);
    setOpenCancelConfirm(true);
  };

  const handleCancelConfirm = async () => {
    if (!selectedOrder) return;
    setIsCanceling(true);
    // TODO: Gọi API hủy đơn hàng
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setOrders(
      orders.map((o) =>
        o.id === selectedOrder.id ? { ...o, status: "Đã hủy" } : o
      )
    );
    setIsCanceling(false);
    setOpenCancelConfirm(false);
    setSelectedOrder(null);
  };

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case "Chờ xử lý":
        return "Đang giao";
      case "Đang giao":
        return "Đã giao";
      default:
        return "Đã giao";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Quản lý đơn hàng</h1>
        <p className="text-gray-600 mt-1">
          Theo dõi và quản lý tất cả đơn hàng
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Tìm kiếm theo mã đơn, tên khách hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="Chờ xử lý">Chờ xử lý</option>
            <option value="Đang giao">Đang giao</option>
            <option value="Đã giao">Đã giao</option>
            <option value="Đã hủy">Đã hủy</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mã đơn
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Khách hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày đặt
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số lượng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tổng tiền
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm font-medium text-gray-900">
                      #{order.id}
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm text-gray-900">{order.customer}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.items} sản phẩm
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {formatVND(order.total)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleViewDetails(order)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Xem chi tiết"
                      >
                        <Eye size={16} />
                      </button>
                      {/* Chỉ cho phép hủy khi đơn hàng ở trạng thái "Chờ xử lý" */}
                      {order.status === "Chờ xử lý" && (
                        <button
                          onClick={() => handleCancelClick(order)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hủy đơn hàng"
                        >
                          <X size={16} />
                        </button>
                      )}
                      {/* Chỉ cho phép cập nhật trạng thái khi chưa giao và chưa hủy */}
                      {order.status !== "Đã giao" &&
                        order.status !== "Đã hủy" && (
                          <button
                            onClick={() => handleStatusUpdate(order)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Cập nhật trạng thái"
                          >
                            <Edit2 size={16} />
                          </button>
                        )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
          <p className="text-sm text-gray-700">
            Hiển thị <span className="font-medium">1</span> đến{" "}
            <span className="font-medium">{filteredOrders.length}</span> trong
            tổng số <span className="font-medium">{orders.length}</span> đơn
            hàng
          </p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
              Trước
            </button>
            <button className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-sm">
              1
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
              Sau
            </button>
          </div>
        </div>
      </div>

      <DialogViewDetails
        open={openViewDetails}
        onClose={() => {
          setOpenViewDetails(false);
          setSelectedOrder(null);
        }}
        title="Chi tiết đơn hàng"
        maxWidth="xl"
      >
        {selectedOrder && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Mã đơn hàng</p>
                <p className="font-medium text-gray-900">#{selectedOrder.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Khách hàng</p>
                <p className="font-medium text-gray-900">
                  {selectedOrder.customer}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Ngày đặt</p>
                <p className="font-medium text-gray-900">
                  {selectedOrder.date}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Số lượng sản phẩm</p>
                <p className="font-medium text-gray-900">
                  {selectedOrder.items} sản phẩm
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Tổng tiền</p>
                <p className="font-medium text-gray-900">
                  {formatVND(selectedOrder.total)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Trạng thái</p>
                <span
                  className={`inline-block px-3 py-1 text-sm rounded-full ${getStatusColor(
                    selectedOrder.status
                  )}`}
                >
                  {selectedOrder.status}
                </span>
              </div>
            </div>
            <div className="border-t border-gray-200 pt-4">
              <h3 className="font-medium text-gray-900 mb-3">
                Danh sách sản phẩm
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Sản phẩm mẫu</p>
                    <p className="text-sm text-gray-500">Số lượng: 2</p>
                  </div>
                  <p className="font-medium text-gray-900">
                    {formatVND(500000)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogViewDetails>

      <DialogStatusUpdate
        open={openStatusUpdate}
        onClose={() => {
          setOpenStatusUpdate(false);
          setSelectedOrder(null);
        }}
        onConfirm={handleStatusConfirm}
        title="Cập nhật trạng thái đơn hàng"
        message="Bạn có muốn thay đổi trạng thái đơn hàng này không?"
        currentStatus={selectedOrder?.status || ""}
        newStatus={selectedOrder ? getNextStatus(selectedOrder.status) : ""}
        isLoading={isUpdating}
      />

      <DialogDeleteConfirm
        open={openCancelConfirm}
        onClose={() => {
          setOpenCancelConfirm(false);
          setSelectedOrder(null);
        }}
        onConfirm={handleCancelConfirm}
        title="Xác nhận hủy đơn hàng"
        message="Bạn có chắc chắn muốn hủy đơn hàng này? Hành động này không thể hoàn tác."
        itemName={
          selectedOrder
            ? `Đơn hàng #${selectedOrder.id} - ${selectedOrder.customer}`
            : undefined
        }
        isLoading={isCanceling}
      />
    </div>
  );
};

export default Orders;
