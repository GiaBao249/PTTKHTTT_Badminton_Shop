import { useMemo, useState, useEffect } from "react";
import { Search, Mail, Phone, Eye } from "lucide-react";
import { DialogViewDetails } from "../Components";
import { useCustomers } from "../hook/useCustomers";

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [openViewDetails, setOpenViewDetails] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedCustomer, setSelectedCustomer] = useState<{
    id: number;
    name: string;
    email: string;
    phone: string;
    orders?: number;
    totalSpent?: number | null;
    joinDate?: string;
  } | null>(null);
  const { data: customersData, isLoading, error } = useCustomers();

  const customers =
    customersData?.map((c) => ({
      id: c.customer_id,
      name: c.customer_name,
      email: c.customer_email,
      phone: c.customer_phone,
      gender: c.customer_gender,
      joinDate: c.created_at,
      orders: c.total_orders ?? 0,
      totalSpent: c.total_spent ?? null,
    })) ?? [];

  const formatVND = (v: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(v);

  const filteredCustomers = useMemo(
    () =>
      customers.filter(
        (customer) =>
          customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.phone?.includes(searchTerm)
      ),
    [customers, searchTerm]
  );

  const handleViewDetails = (customer: (typeof customers)[0]) => {
    setSelectedCustomer(customer);
    setOpenViewDetails(true);
  };

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCustomers.length / itemsPerPage)
  );
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCustomers = filteredCustomers.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const paginationRange = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const range: (number | string)[] = [];
    const addPage = (page: number) => {
      if (!range.includes(page)) range.push(page);
    };
    addPage(1);
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    if (start > 2) range.push("start-ellipsis");
    for (let page = start; page <= end; page++) addPage(page);
    if (end < totalPages - 1) range.push("end-ellipsis");
    addPage(totalPages);
    return range;
  }, [currentPage, totalPages]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Quản lý khách hàng</h1>
        <p className="text-gray-600 mt-1">
          Xem và quản lý thông tin khách hàng
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, email, số điện thoại..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="px-6 py-10 text-center text-gray-500">
            Đang tải danh sách khách hàng...
          </div>
        ) : error ? (
          <div className="px-6 py-10 text-center text-red-500">
            {(error as Error).message || "Không thể tải khách hàng"}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Khách hàng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Liên hệ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Số đơn hàng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tổng chi tiêu
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedCustomers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-10 text-center text-gray-500"
                      >
                        Không có khách hàng nào
                      </td>
                    </tr>
                  ) : (
                    paginatedCustomers.map((customer) => (
                      <tr key={customer.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                              {customer.name?.[0]?.toUpperCase() || "?"}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {customer.name || "Không rõ"}
                              </p>
                              <p className="text-xs text-gray-500">
                                ID: #{customer.id}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Mail size={14} />
                              <span>{customer.email || "-"}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone size={14} />
                              <span>{customer.phone || "-"}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full font-medium">
                            {customer.orders ?? 0} đơn
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          {customer.totalSpent != null
                            ? formatVND(customer.totalSpent)
                            : "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleViewDetails(customer)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
              <p className="text-sm text-gray-700">
                Hiển thị{" "}
                <span className="font-medium">
                  {paginatedCustomers.length === 0 ? 0 : startIndex + 1}
                </span>{" "}
                đến{" "}
                <span className="font-medium">
                  {Math.min(
                    startIndex + paginatedCustomers.length,
                    filteredCustomers.length
                  )}
                </span>{" "}
                trong tổng số{" "}
                <span className="font-medium">{filteredCustomers.length}</span>{" "}
                khách hàng
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trước
                </button>
                {paginationRange.map((page, index) =>
                  typeof page === "string" ? (
                    <span
                      key={`${page}-${index}`}
                      className="px-2 text-gray-500"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded-lg text-sm ${
                        currentPage === page
                          ? "bg-indigo-600 text-white"
                          : "border border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sau
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <DialogViewDetails
        open={openViewDetails}
        onClose={() => {
          setOpenViewDetails(false);
          setSelectedCustomer(null);
        }}
        title="Chi tiết khách hàng"
        maxWidth="lg"
      >
        {selectedCustomer && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
              <div className="h-16 w-16 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-xl">
                {selectedCustomer.name?.[0]?.toUpperCase() || "?"}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {selectedCustomer.name}
                </h3>
                <p className="text-sm text-gray-500">
                  ID: #{selectedCustomer.id}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Email</p>
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-gray-400" />
                  <p className="font-medium text-gray-900">
                    {selectedCustomer.email || "-"}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Số điện thoại</p>
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-gray-400" />
                  <p className="font-medium text-gray-900">
                    {selectedCustomer.phone || "-"}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Số đơn hàng</p>
                <p className="font-medium text-gray-900">
                  {selectedCustomer.orders ?? 0} đơn
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Tổng chi tiêu</p>
                <p className="font-medium text-gray-900">
                  {selectedCustomer.totalSpent != null
                    ? formatVND(selectedCustomer.totalSpent)
                    : "-"}
                </p>
              </div>
            </div>
          </div>
        )}
      </DialogViewDetails>
    </div>
  );
};

export default Customers;
