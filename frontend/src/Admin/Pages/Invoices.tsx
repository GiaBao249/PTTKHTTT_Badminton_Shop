import { useState, useEffect } from "react";
import {
  Search,
  Eye,
  Download,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { Dialog } from "../Components";
import { useInvoices, type Invoice } from "../hook/useInvoices";
import { useInvoice } from "../hook/useInvoice";
import { InvoicePDFDocument } from "../../Components/InvoicePDF";

const Invoices = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Delivered"); // Mặc định chỉ hiển thị đơn đã giao
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const itemsPerPage = 10;
  const [openViewDetails, setOpenViewDetails] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const {
    data: invoicesData,
    isLoading,
    error,
  } = useInvoices({
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const invoices = invoicesData || [];

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (date: string | number) => {
    if (!date) return "-";
    const d = typeof date === "string" ? new Date(date) : new Date(date * 1000);
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: "Chờ xử lý",
      processing: "Chờ xử lý",
      shipped: "Đang giao",
      delivered: "Đã giao",
      completed: "Hoàn thành",
      cancelled: "Đã hủy",
    };
    return statusMap[status.toLowerCase()] || status;
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.order_id.toString().includes(searchTerm) ||
      invoice.customer?.customer_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      invoice.customer?.customer_phone?.includes(searchTerm);
    return matchesSearch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedInvoices = filteredInvoices.slice(startIndex, endIndex);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, startDate, endDate]);

  const handleViewDetails = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setOpenViewDetails(true);
  };

  // Component to handle PDF download with full invoice data
  function InvoicePDFButton({ invoiceId }: { invoiceId: number }) {
    const { data: fullInvoice, isLoading } = useInvoice(invoiceId);

    if (isLoading || !fullInvoice) {
      return (
        <div className="flex justify-end mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-gray-300 text-gray-600 rounded-lg cursor-not-allowed">
            Đang tải dữ liệu...
          </div>
        </div>
      );
    }

    return (
      <div className="flex justify-end mb-4">
        <PDFDownloadLink
          document={<InvoicePDFDocument invoice={fullInvoice} />}
          fileName={`hoa-don-${fullInvoice.order_id}.pdf`}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          {({ loading }) =>
            loading ? (
              "Đang tạo PDF..."
            ) : (
              <>
                <Download size={16} />
                Tải PDF
              </>
            )
          }
        </PDFDownloadLink>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Hóa đơn bán hàng</h1>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Filter size={18} />
          Lọc theo thời gian
        </button>
      </div>

      {/* Filter Section */}
      {showFilters && (
        <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Từ ngày
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Đến ngày
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trạng thái
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="Delivered">Đã giao</option>
                <option value="Shipped">Đang giao</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setStartDate("");
                setEndDate("");
                setStatusFilter("Delivered");
              }}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Xóa bộ lọc
            </button>
          </div>
        </div>
      )}

      {/* Search and Stats */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Tìm kiếm theo mã đơn, tên khách hàng, số điện thoại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
        <div className="text-sm text-gray-600">
          Tìm thấy{" "}
          <span className="font-semibold">{filteredInvoices.length}</span> hóa
          đơn
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Đang tải...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">
            Lỗi khi tải dữ liệu
          </div>
        ) : paginatedInvoices.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Không có hóa đơn nào
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Mã đơn
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Khách hàng
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Ngày đặt
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Tổng tiền
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedInvoices.map((invoice) => (
                    <tr key={invoice.order_id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{invoice.order_id}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {invoice.customer?.customer_name || "-"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(invoice.order_date)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {formatVND(invoice.total_amount)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                            invoice.status
                          )}`}
                        >
                          {getStatusText(invoice.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewDetails(invoice)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye size={16} />
                          </button>
                          <PDFDownloadLink
                            document={<InvoicePDFDocument invoice={invoice} />}
                            fileName={`hoa-don-${invoice.order_id}.pdf`}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          >
                            {({ loading }) =>
                              loading ? (
                                <span className="text-xs">...</span>
                              ) : (
                                <Download size={16} />
                              )
                            }
                          </PDFDownloadLink>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 0 && (
              <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                <p className="text-sm text-gray-700">
                  Hiển thị{" "}
                  <span className="font-medium">
                    {filteredInvoices.length === 0 ? 0 : startIndex + 1}
                  </span>{" "}
                  đến{" "}
                  <span className="font-medium">
                    {Math.min(endIndex, filteredInvoices.length)}
                  </span>{" "}
                  trong tổng số{" "}
                  <span className="font-medium">{filteredInvoices.length}</span>{" "}
                  hóa đơn
                </p>
                {totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      {/* <ChevronLeft size={16} /> */}
                      Trước
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((page) => {
                        // Show first page, last page, current page, and pages around current
                        if (totalPages <= 7) return true;
                        if (page === 1 || page === totalPages) return true;
                        if (Math.abs(page - currentPage) <= 1) return true;
                        return false;
                      })
                      .map((page, index, array) => {
                        // Add ellipsis
                        const showEllipsisBefore =
                          index > 0 && array[index - 1] !== page - 1;
                        return (
                          <div key={page} className="flex items-center gap-1">
                            {showEllipsisBefore && (
                              <span className="px-2 text-gray-500">...</span>
                            )}
                            <button
                              onClick={() => setCurrentPage(page)}
                              className={`px-3 py-1 rounded-lg text-sm ${
                                currentPage === page
                                  ? "bg-indigo-600 text-white"
                                  : "border border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              {page}
                            </button>
                          </div>
                        );
                      })}
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      Sau
                      {/* <ChevronRight size={16} /> */}
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* View Details Dialog */}
      {selectedInvoice && (
        <Dialog
          open={openViewDetails}
          onClose={() => {
            setOpenViewDetails(false);
            setSelectedInvoice(null);
          }}
          title="Chi tiết hóa đơn"
          maxWidth="xl"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Mã đơn hàng</p>
                <p className="font-medium text-gray-900">
                  #{selectedInvoice.order_id}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Khách hàng</p>
                <p className="font-medium text-gray-900">
                  {selectedInvoice.customer?.customer_name || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Số điện thoại</p>
                <p className="font-medium text-gray-900">
                  {selectedInvoice.customer?.customer_phone || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Ngày đặt</p>
                <p className="font-medium text-gray-900">
                  {formatDate(selectedInvoice.order_date)}
                </p>
              </div>
              {selectedInvoice.delivery_date && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Ngày giao</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(selectedInvoice.delivery_date)}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500 mb-1">Trạng thái</p>
                <span
                  className={`inline-block px-3 py-1 text-sm rounded-full ${getStatusColor(
                    selectedInvoice.status
                  )}`}
                >
                  {getStatusText(selectedInvoice.status)}
                </span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between mb-4 mt-4">
                <h3 className="font-medium text-gray-900">
                  Danh sách sản phẩm
                </h3>
                <InvoicePDFButton invoiceId={selectedInvoice.order_id} />
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {selectedInvoice.orderdetail?.map((item) => (
                  <div
                    key={`${item.order_id}-${item.product_item_id}`}
                    className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {item.product_item?.product?.product_name ||
                            `SP #${item.product_item_id}`}
                        </p>
                        {item.product_item?.product?.category && (
                          <p className="text-xs text-gray-500 mt-1">
                            {item.product_item.product.category.category_name}
                          </p>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-sm text-gray-600">
                          {formatVND(item.product_item?.product?.price || 0)} ×{" "}
                          {item.quantity}
                        </p>
                        <p className="font-semibold text-gray-900 mt-1">
                          {formatVND(
                            item.amount ||
                              (item.product_item?.product?.price || 0) *
                                (item.quantity || 0)
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-700">
                  Tổng tiền:
                </span>
                <span className="text-2xl font-bold text-indigo-600">
                  {formatVND(selectedInvoice.total_amount)}
                </span>
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
};

export default Invoices;
