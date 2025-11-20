import { useEffect, useState } from "react";
import { Search, Eye, Edit2, X } from "lucide-react";
import {
  DialogViewDetails,
  DialogStatusUpdate,
  DialogDeleteConfirm,
} from "../Components";
import { useOrders } from "../hook/useOrders";
import { useCustomers } from "../hook/useCustomers";
import { useOrderDetail } from "../hook/useOrderDetail";
import { useUpdateOrderStatus } from "../hook/useUpdateOrderStatus";
import { useProducts } from "../hook/useProducts";
import { useProductItems } from "../hook/useProductItems";

const Orders = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [openViewDetails, setOpenViewDetails] = useState(false);
  const [openStatusUpdate, setOpenStatusUpdate] = useState(false);
  const [openCancelConfirm, setOpenCancelConfirm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<{
    order_id: number;
    customer_id: number;
    status: string;
    total_amount: number;
    order_date: number;
    delivery_date: number;
    address_id: string;
  } | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);

  interface Order {
    order_id: number;
    customer_id: number;
    status: string;
    total_amount: number;
    order_date: number;
    delivery_date: number;
    address_id: string;
  }

  interface Product {
    product_id: number;
    supplier_id: number;
    category_id: number;
    product_name: string;
    price: number;
    description: string;
    warranty_period: number;
  }

  interface ProductItem {
      product_item_id: number;
      product_id: number;
      quantity: number;
  }



  const { data } = useOrders();
  const [orders, setOrders] = useState<Order[]>(data || []);
  const customers = useCustomers().data || [];
  const updateOrderStatus = useUpdateOrderStatus();
  const products = useProducts().data || [];
  const productItems = useProductItems().data || [];

  useEffect(() => {
    if (data) {
      setOrders(data);
    }
  }, [data]);

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

  const getConverseionStatus = (status: string) => {
    switch (status) {
      case "Delivered":
        return "Đã giao";
      case "Shipped":
        return "Đang giao";
      case "Pending":
        return "Chờ xử lý";
      case "Cancelled":
        return "Đã hủy"; 
      default:
        return status
    };
  }

  const getReverseStatus = (status: string) => {
    switch (status) {
        case "Đã giao":
            return "Delivered";
        case "Đang giao":
            return "Shipped";
        case "Chờ xử lý":
            return "Pending";
        case "Đã hủy":
            return "Cancelled";
        default:
            return status;
    }
};

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      customers.find(c => c.customer_id === order.customer_id)?.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.order_id.toString().includes(searchTerm);
    const matchesStatus =
      statusFilter === "all" || getConverseionStatus(order.status) === statusFilter;
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
      getConverseionStatus(selectedOrder.status) === "Chờ xử lý"
        ? "Đang giao"
        : getConverseionStatus(selectedOrder.status) === "Đang giao"
        ? "Đã giao"
        : "Đã giao";
    console.log('Cập nhật trạng thái thành:', nextStatus);
    try {
        await updateOrderStatus.mutateAsync({
            order_id: selectedOrder.order_id,
            status: getReverseStatus(nextStatus)
        });
        console.log('Cập nhật trạng thái thành công');
    } catch (error) {
        // Hiển thị thông báo lỗi
        console.error('Lỗi cập nhật:', error);
    }
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
    // await new Promise((resolve) => setTimeout(resolve, 1500));
    try {
        await updateOrderStatus.mutateAsync({
            order_id: selectedOrder.order_id,
            status: getReverseStatus("Đã hủy")
        });
        console.log('Cập nhật trạng thái thành công');
    } catch (error) {
        // Hiển thị thông báo lỗi
        console.error('Lỗi cập nhật:', error);
    }
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

  function OrderProductCount({ orderId }: { orderId: number }) {
    const { data: orderDetails } = useOrderDetail(orderId);
    return <span>{orderDetails?.length || 0} sản phẩm</span>;
  }

  function OrderProductList({ orderId, products, productItems }: { orderId: number; products: Product[]; productItems: ProductItem[] }) {
    const { data: orderDetails } = useOrderDetail(orderId);
    console.log('🔍 Order details for orderId', orderId, ':', orderDetails);
    if (!orderDetails || orderDetails.length === 0) {
      return <div className="text-sm text-gray-500 text-center py-2">Không có chi tiết đơn hàng</div>;
    }
    return (
      <div className="space-y-2">
        {orderDetails.map((od: any, idx: number) => {
          const pi = productItems.find((p: ProductItem) => Number(p.product_item_id) === Number(od.product_item_id));
          const product = pi ? products.find((pr: Product) => Number(pr.product_id) === Number(pi.product_id)) : undefined;
          const name = product?.product_name;
          const unitPrice = product?.price;
          const lineAmount = typeof od.amount === "number" ? od.amount : (typeof unitPrice === "number" ? unitPrice * od.quantity : undefined);
          return (
        <div key={`${od.product_item_id}-${idx}`} className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="font-medium text-gray-900">{name}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-600">
                <span className="px-2 py-1 bg-gray-100 rounded">ID: #{product?.product_id ?? "-"}</span>
                <span className="px-2 py-1 bg-gray-100 rounded">Mục: #{od.product_item_id}</span>
                <span className="px-2 py-1 bg-gray-100 rounded">Danh mục: {product?.category_id ?? "-"}</span>
              </div>
              <div className="mt-1 text-xs text-gray-600">
                <span>Nhà cung cấp: {product?.supplier_id ?? "-"}</span>
                <span className="mx-2">•</span>
                <span>Bảo hành: {product?.warranty_period != null ? `${product.warranty_period} tháng` : "-"}</span>
                <span className="mx-2">•</span>
                <span>Tồn kho: {pi?.quantity != null ? pi.quantity : "-"}</span>
              </div>
              {product?.description && (
                <p className="mt-1 text-xs text-gray-500">{product.description}</p>
              )}
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">Đơn giá</div>
              <div className="font-medium text-gray-900">
                {typeof unitPrice === "number" ? formatVND(unitPrice) : "-"}
              </div>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-sm text-gray-500">Số lượng: {od.quantity}</p>
            <div className="text-right">
              <div className="text-xs text-gray-500">Thành tiền</div>
              <p className="font-semibold text-gray-900">
                {typeof lineAmount === "number" ? formatVND(lineAmount) : (typeof unitPrice === "number" ? formatVND(unitPrice * od.quantity) : "-")}
              </p>
            </div>
          </div>
        </div>
      );
        })}
      </div>
    );
  }

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
                <tr key={order.order_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm font-medium text-gray-900">
                      #{order.order_id}
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm text-gray-900">{customers.find(c => c.customer_id === order.customer_id)?.customer_name}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.order_date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <OrderProductCount orderId={order.order_id} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {formatVND(order.total_amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(
                        getConverseionStatus(order.status)
                      )}`}
                    >
                      {getConverseionStatus(order.status)}
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
                      {getConverseionStatus(order.status) === "Chờ xử lý" && (
                        <button
                          onClick={() => handleCancelClick(order)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hủy đơn hàng"
                        >
                          <X size={16} />
                        </button>
                      )}
                      {getConverseionStatus(order.status) !== "Đã giao" &&
                        getConverseionStatus(order.status) !== "Đã hủy" && (
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
                <p className="font-medium text-gray-900">#{selectedOrder.order_id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Khách hàng</p>
                <p className="font-medium text-gray-900">
                  {customers.find(c => c.customer_id == selectedOrder.customer_id)?.customer_name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Ngày đặt</p>
                <p className="font-medium text-gray-900">
                  {selectedOrder.order_date}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Số lượng sản phẩm</p>
                <p className="font-medium text-gray-900">
                  <OrderProductCount orderId={selectedOrder.order_id} />
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Tổng tiền</p>
                <p className="font-medium text-gray-900">
                  {formatVND(selectedOrder.total_amount)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Trạng thái</p>
                <span
                  className={`inline-block px-3 py-1 text-sm rounded-full ${getStatusColor(
                    getConverseionStatus(selectedOrder.status)
                  )}`}
                >
                  {getConverseionStatus(selectedOrder.status)}
                </span>
              </div>
            </div>
            <div className="border-t border-gray-200 pt-4">
              <h3 className="font-medium text-gray-900 mb-3">
                Danh sách sản phẩm
              </h3>
              <div className="space-y-2">
                <OrderProductList orderId={selectedOrder.order_id} products={products} productItems={productItems} />
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
            ? `Đơn hàng #${selectedOrder.order_id} - ${customers.find(c => c.customer_id == selectedOrder.customer_id)?.customer_name}`
            : undefined
        }
        isLoading={isCanceling}
      />
    </div>
  );
};

export default Orders;
