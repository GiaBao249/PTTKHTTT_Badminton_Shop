import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Eye,
  Trash2,
  Download,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
  Font,
} from "@react-pdf/renderer";
import { Dialog } from "../Components";
import { usePurchaseOrders } from "../hook/usePurchaseOrders";
import { usePurchaseOrderDetail } from "../hook/usePurchaseOrderDetail";
import { useSuppliers } from "../hook/useSuppliers";
import { useEmployees } from "../hook/useEmployees";
import { useProducts } from "../hook/useProducts";
import { useAuth } from "../../contexts/AuthContext";
import BeVietnamRegular from "../../assets/fonts/Be_Vietnam_Pro/BeVietnamPro-Regular.ttf?url";
import BeVietnamSemiBold from "../../assets/fonts/Be_Vietnam_Pro/BeVietnamPro-SemiBold.ttf?url";
import BeVietnamBold from "../../assets/fonts/Be_Vietnam_Pro/BeVietnamPro-Bold.ttf?url";
import { toast } from "react-toastify";

Font.register({
  family: "BeVietnamPro",
  fonts: [
    { src: BeVietnamRegular, fontWeight: "normal" },
    { src: BeVietnamSemiBold, fontWeight: 600 },
    { src: BeVietnamBold, fontWeight: 700 },
  ],
});

interface PurchaseOrderItem {
  product_id: number | "";
  price: number | "";
  quantity: number | "";
}

const PurchaseOrders = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [openAddPurchaseOrder, setOpenAddPurchaseOrder] = useState(false);
  const [openViewDetails, setOpenViewDetails] = useState(false);
  const [selectedPurchaseOrder, setSelectedPurchaseOrder] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [supplierId, setSupplierId] = useState<number | "">("");
  const [employeeId, setEmployeeId] = useState<number | "">("");
  const [items, setItems] = useState<PurchaseOrderItem[]>([
    {
      product_id: "",
      price: "",
      quantity: "",
    },
  ]);

  const queryClient = useQueryClient();
  const {
    data: purchaseOrdersData,
    refetch: refetchPurchaseOrders,
    isLoading: isLoadingPurchaseOrders,
    error: purchaseOrdersError,
  } = usePurchaseOrders();
  const { data: suppliersData } = useSuppliers();
  const { data: employeesData } = useEmployees();
  const { data: productsData, refetch: refetchProducts } = useProducts();
  const { user } = useAuth();

  const purchaseOrders = purchaseOrdersData || [];

  useEffect(() => {}, [
    purchaseOrdersData,
    purchaseOrdersError,
    isLoadingPurchaseOrders,
  ]);
  const suppliers = suppliersData || [];
  const employees = employeesData || [];
  const products = productsData || [];

  useEffect(() => {
    if (user && user.id && user.role === "admin") {
      const userEmployeeId = Number(user.id);
      if (!isNaN(userEmployeeId)) {
        if (employees.length > 0) {
          const currentEmployee = employees.find(
            (e) =>
              e.employee_id === userEmployeeId ||
              Number(e.employee_id) === userEmployeeId ||
              e.employee_id.toString() === user.id.toString()
          );
          if (currentEmployee) {
            setEmployeeId(currentEmployee.employee_id);
          } else {
            setEmployeeId(userEmployeeId);
          }
        } else {
          setEmployeeId(userEmployeeId);
        }
      }
    }
  }, [user, employees]);

  // Refetch products khi mở dialog để đảm bảo danh sách luôn cập nhật
  useEffect(() => {
    if (openAddPurchaseOrder) {
      // Invalidate cache và refetch để đảm bảo danh sách mới nhất
      queryClient.invalidateQueries({ queryKey: ["products"] });
      refetchProducts().catch((error) => {
        console.error("Lỗi khi refetch products:", error);
      });
    }
  }, [openAddPurchaseOrder, refetchProducts, queryClient]);

  const formatVND = (v: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(v);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const pdfStyles = StyleSheet.create({
    page: {
      padding: 32,
      fontSize: 12,
      fontFamily: "BeVietnamPro",
      color: "#111827",
    },
    section: {
      marginBottom: 16,
    },
    title: {
      fontSize: 18,
      marginBottom: 8,
      fontWeight: 700,
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 4,
    },
    label: {
      fontWeight: 600,
    },
    tableHeader: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: "#E5E7EB",
      borderBottomStyle: "solid",
      paddingVertical: 6,
      fontWeight: 600,
    },
    tableRow: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: "#F3F4F6",
      borderBottomStyle: "solid",
      paddingVertical: 6,
    },
    cell: {
      flex: 1,
      paddingRight: 6,
    },
    summaryBox: {
      marginTop: 12,
      padding: 10,
      backgroundColor: "#EEF2FF",
      borderRadius: 8,
    },
  });

  const PurchaseOrderPDFDocument = ({ detail }: { detail: any }) => (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.title}>
            Phiếu nhập #{detail.purchaseorder_id}
          </Text>
          <View style={pdfStyles.row}>
            <Text style={pdfStyles.label}>Ngày tạo:</Text>
            <Text>{formatDate(detail.purchaseorder_date)}</Text>
          </View>
          <View style={pdfStyles.row}>
            <Text style={pdfStyles.label}>Nhà cung cấp:</Text>
            <Text>
              {detail.supplier?.supplier_name || `ID: ${detail.supplier_id}`}
            </Text>
          </View>
          <View style={pdfStyles.row}>
            <Text style={pdfStyles.label}>Nhân viên:</Text>
            <Text>{detail.employee?.name || `ID: ${detail.employee_id}`}</Text>
          </View>
        </View>
        <View style={pdfStyles.section}>
          <View style={pdfStyles.tableHeader}>
            <Text style={[pdfStyles.cell, { flex: 0.5 }]}>STT</Text>
            <Text style={pdfStyles.cell}>Sản phẩm</Text>
            <Text style={[pdfStyles.cell, { flex: 0.7, textAlign: "right" }]}>
              Giá nhập
            </Text>
            <Text style={[pdfStyles.cell, { flex: 0.5, textAlign: "right" }]}>
              SL
            </Text>
            <Text style={[pdfStyles.cell, { flex: 0.8, textAlign: "right" }]}>
              Thành tiền
            </Text>
          </View>
          {detail.items?.map((item: any, index: number) => {
            const total = (item.price || 0) * (item.quantity || 0);
            return (
              <View
                style={pdfStyles.tableRow}
                key={item.purchaseorderdetail_id}
              >
                <Text style={[pdfStyles.cell, { flex: 0.5 }]}>{index + 1}</Text>
                <Text style={pdfStyles.cell}>
                  {item.product?.product_name || `ID: ${item.product_id}`}
                </Text>
                <Text
                  style={[pdfStyles.cell, { flex: 0.7, textAlign: "right" }]}
                >
                  {formatVND(item.price || 0)}
                </Text>
                <Text
                  style={[pdfStyles.cell, { flex: 0.5, textAlign: "right" }]}
                >
                  {item.quantity || 0}
                </Text>
                <Text
                  style={[pdfStyles.cell, { flex: 0.8, textAlign: "right" }]}
                >
                  {formatVND(total)}
                </Text>
              </View>
            );
          })}
        </View>
        <View style={pdfStyles.summaryBox}>
          <View style={pdfStyles.row}>
            <Text style={pdfStyles.label}>Tổng số lượng:</Text>
            <Text>
              {detail.items?.reduce(
                (sum: number, item: any) => sum + (item.quantity || 0),
                0
              ) || 0}{" "}
              sản phẩm
            </Text>
          </View>
          <View style={pdfStyles.row}>
            <Text style={pdfStyles.label}>Tổng tiền:</Text>
            <Text>
              {formatVND(
                detail.items?.reduce(
                  (sum: number, item: any) =>
                    sum + (item.price || 0) * (item.quantity || 0),
                  0
                ) || 0
              )}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );

  const filteredPurchaseOrders = purchaseOrders.filter((po) => {
    const matchesSearch =
      po.purchaseorder_id.toString().includes(searchTerm) ||
      po.supplier?.supplier_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      po.employee?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredPurchaseOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPurchaseOrders = filteredPurchaseOrders.slice(
    startIndex,
    endIndex
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        product_id: "",
        price: "",
        quantity: "",
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (
    index: number,
    field: keyof PurchaseOrderItem,
    value: any
  ) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    console.log("handleItemChange - field:", field, "value:", value, "type:", typeof value);
    console.log("newItems after update:", newItems);
    console.log("Updated item:", newItems[index]);
    
    // Khi chọn sản phẩm có sẵn, tự động điền giá nhập nếu có
    if (field === "product_id" && value) {
      const selectedProduct = products.find(
        (p) => Number(p.product_id) === Number(value)
      );
      console.log("Finding product with value:", value, "Found:", selectedProduct);
      if (selectedProduct && selectedProduct.price_purchase) {
        newItems[index].price = selectedProduct.price_purchase;
        console.log("Auto-filled price:", selectedProduct.price_purchase);
      }
    }
    
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId || !employeeId || items.length === 0) {
      toast.warning("Vui lòng điền đầy đủ thông tin");
      return;
    }

    // Validation chi tiết hơn
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      if (!item.product_id) {
        toast.warning(`Sản phẩm #${i + 1}: Vui lòng chọn sản phẩm`);
        return;
      }
      if (!item.price || Number(item.price) <= 0) {
        toast.warning(`Sản phẩm #${i + 1}: Giá nhập phải lớn hơn 0`);
        return;
      }
      if (!item.quantity || Number(item.quantity) <= 0) {
        toast.warning(`Sản phẩm #${i + 1}: Số lượng phải lớn hơn 0`);
        return;
      }
      
      // Kiểm tra số lượng hợp lý
      if (Number(item.quantity) > 100000) {
        toast.warning(`Sản phẩm #${i + 1}: Số lượng quá lớn (tối đa 100,000)`);
        return;
      }
      
      // Kiểm tra giá hợp lý
      if (Number(item.price) > 1000000000) {
        toast.warning(`Sản phẩm #${i + 1}: Giá quá lớn (tối đa 1 tỷ VND)`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const API_BASE = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem("auth_token");
      const response = await fetch(
        `${API_BASE}/api/admin/createPurchaseOrder`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({
            supplier_id: supplierId,
            employee_id: employeeId,
            items: items.map((item) => ({
              product_id: Number(item.product_id),
              price: Number(item.price),
              quantity: Number(item.quantity),
            })),
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        const errorMessage = error.error || "Không thể tạo phiếu nhập";
        console.error("Lỗi tạo phiếu nhập:", error);
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log("Tạo phiếu nhập thành công:", result);
      
      toast.success("Tạo phiếu nhập thành công!");
      
      // Refetch tất cả dữ liệu để cập nhật
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["purchaseOrders"] });
      queryClient.invalidateQueries({ queryKey: ["productItems"] });
      
      // Refetch products ngay để đảm bảo dropdown có sản phẩm mới
      await Promise.all([
        refetchProducts(),
        refetchPurchaseOrders(),
        queryClient.refetchQueries({ queryKey: ["productItems"] }),
      ]);
      
      // Đóng dialog và reset form sau khi đã refetch xong
      setOpenAddPurchaseOrder(false);
      setSupplierId("");
      setItems([
        {
          product_id: "",
          price: "",
          quantity: "",
        },
      ]);
    } catch (error: any) {
      toast.warning(error.message || "Có lỗi xảy ra khi tạo phiếu nhập");
      console.error("Lỗi khi tạo phiếu nhập:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewDetails = (po: any) => {
    setSelectedPurchaseOrder(po);
    setOpenViewDetails(true);
  };

  const {
    data: purchaseOrderDetail,
    isLoading: isLoadingDetail,
    error: detailError,
  } = usePurchaseOrderDetail(
    openViewDetails ? selectedPurchaseOrder?.purchaseorder_id : null
  );

  // Component to handle PDF download for purchase order in the list
  function PurchaseOrderPDFButton({
    purchaseOrderId,
  }: {
    purchaseOrderId: number;
  }) {
    const { data: detail, isLoading } = usePurchaseOrderDetail(purchaseOrderId);

    if (isLoading) {
      return (
        <button
          className="p-2 text-gray-400 cursor-not-allowed rounded-lg"
          disabled
          title="Đang tải..."
        >
          <Download size={16} />
        </button>
      );
    }

    if (!detail) {
      return null;
    }

    return (
      <PDFDownloadLink
        document={<PurchaseOrderPDFDocument detail={detail} />}
        fileName={`phieu-nhap-${purchaseOrderId}.pdf`}
        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
        title="Tải PDF"
      >
        {({ loading }) =>
          loading ? (
            <span className="text-xs">...</span>
          ) : (
            <Download size={16} />
          )
        }
      </PDFDownloadLink>
    );
  }

  useEffect(() => {
    if (openViewDetails && selectedPurchaseOrder) {
      console.log(
        "Viewing purchase order:",
        selectedPurchaseOrder.purchaseorder_id
      );
      console.log("Purchase order detail data:", purchaseOrderDetail);
      console.log("Detail error:", detailError);
    }
  }, [
    openViewDetails,
    selectedPurchaseOrder,
    purchaseOrderDetail,
    detailError,
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Quản lý phiếu nhập
          </h1>
          <p className="text-gray-600 mt-1">
            Quản lý phiếu nhập hàng và cập nhật tồn kho
          </p>
        </div>
        <button
          onClick={() => setOpenAddPurchaseOrder(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus size={20} />
          Tạo phiếu nhập
        </button>
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
              placeholder="Tìm kiếm theo mã phiếu, nhà cung cấp, nhân viên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoadingPurchaseOrders ? (
          <div className="px-6 py-8 text-center text-gray-500">
            Đang tải danh sách phiếu nhập...
          </div>
        ) : purchaseOrdersError ? (
          <div className="px-6 py-8 text-center">
            <p className="text-red-500 mb-2">
              Lỗi khi tải danh sách phiếu nhập:{" "}
              {purchaseOrdersError instanceof Error
                ? purchaseOrdersError.message
                : "Lỗi không xác định"}
            </p>
            <button
              onClick={() => refetchPurchaseOrders()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Thử lại
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mã phiếu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nhà cung cấp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nhân viên
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedPurchaseOrders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      Chưa có phiếu nhập nào
                    </td>
                  </tr>
                ) : (
                  paginatedPurchaseOrders.map((po) => (
                    <tr key={po.purchaseorder_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          #{po.purchaseorder_id}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {po.supplier?.supplier_name ||
                            `ID: ${po.supplier_id}`}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {po.employee?.name || `ID: ${po.employee_id}`}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(po.purchaseorder_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewDetails(po)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye size={16} />
                          </button>
                          <PurchaseOrderPDFButton
                            purchaseOrderId={po.purchaseorder_id}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
              <p className="text-sm text-gray-700">
                Hiển thị{" "}
                <span className="font-medium">
                  {paginatedPurchaseOrders.length === 0 ? 0 : startIndex + 1}
                </span>{" "}
                đến{" "}
                <span className="font-medium">
                  {Math.min(endIndex, filteredPurchaseOrders.length)}
                </span>{" "}
                trong tổng số{" "}
                <span className="font-medium">
                  {filteredPurchaseOrders.length}
                </span>{" "}
                phiếu nhập
              </p>
              {totalPages > 0 && (
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
                      if (totalPages <= 7) return true;
                      if (page === 1 || page === totalPages) return true;
                      if (Math.abs(page - currentPage) <= 1) return true;
                      return false;
                    })
                    .map((page, index, array) => {
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
          </div>
        )}
      </div>

      <Dialog
        open={openAddPurchaseOrder}
        onClose={() => {
          // Reset form khi đóng
          setSupplierId("");
          setItems([
            {
              product_id: "",
              price: "",
              quantity: "",
            },
          ]);
          setOpenAddPurchaseOrder(false);
        }}
        title="Tạo phiếu nhập mới"
        maxWidth="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nhà cung cấp <span className="text-red-500">*</span>
              </label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="">Chọn nhà cung cấp</option>
                {suppliers.map((supplier) => (
                  <option
                    key={supplier.supplier_id}
                    value={supplier.supplier_id}
                  >
                    {supplier.supplier_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nhân viên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={
                  employees.find((e) => e.employee_id === employeeId)?.name ||
                  user?.name ||
                  "Đang tải..."
                }
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
              />
              {!employeeId && (
                <p className="mt-1 text-xs text-red-500">
                  Không tìm thấy thông tin nhân viên. Vui lòng đăng nhập lại.
                </p>
              )}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Danh sách sản phẩm
              </h3>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus size={16} />
                Thêm sản phẩm
              </button>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {items.map((item, index) => {
                // Tìm sản phẩm đã chọn để hiển thị thông tin
                const selectedProduct = item.product_id !== "" && item.product_id !== null && item.product_id !== undefined
                  ? products.find((p) => Number(p.product_id) === Number(item.product_id))
                  : null;
                
                // Debug: Log current item state
                console.log(`Item ${index} - product_id:`, item.product_id, "type:", typeof item.product_id);

                return (
                  <div
                    key={index}
                    className="p-5 border-2 border-gray-200 rounded-xl bg-white shadow-sm hover:border-indigo-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-semibold text-sm">
                          {index + 1}
                        </div>
                        <h4 className="font-semibold text-gray-900 text-base">
                          Sản phẩm #{index + 1}
                        </h4>
                      </div>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa sản phẩm"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>


                    {/* Hiển thị thông tin sản phẩm đã chọn */}
                    {selectedProduct && (
                      <div className="mb-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                        <div className="flex items-start gap-3">
                          {selectedProduct.thumbnail && (
                            <img
                              src={selectedProduct.thumbnail}
                              alt={selectedProduct.product_name || `Sản phẩm ${selectedProduct.product_id}`}
                              className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                            />
                          )}
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900 text-sm">
                              {selectedProduct.product_name || `Sản phẩm #${selectedProduct.product_id}`}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              ID: {selectedProduct.product_id}
                              {selectedProduct.price_purchase && (
                                <> • Giá nhập hiện tại: {formatVND(selectedProduct.price_purchase)}</>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Chọn sản phẩm <span className="text-red-500">*</span>
                        </label>
                        <select
                          key={`product-select-${index}-${item.product_id || 'empty'}`}
                          value={
                            item.product_id === "" || item.product_id === null || item.product_id === undefined || item.product_id === 0
                              ? ""
                              : String(item.product_id)
                          }
                          onChange={(e) => {
                            const productId = e.target.value ? Number(e.target.value) : "";
                            console.log("Select onChange - productId:", productId, "type:", typeof productId);
                            console.log("Current item.product_id:", item.product_id, "type:", typeof item.product_id);

                            // Update product_id
                            const newItems = [...items];
                            newItems[index] = { ...newItems[index], product_id: productId };
                            
                            // Tự động điền giá nhập nếu sản phẩm có giá nhập
                            if (productId) {
                              const selectedProduct = products.find(
                                (p) => Number(p.product_id) === Number(productId)
                              );
                              console.log("Selected product:", selectedProduct);
                              if (selectedProduct && selectedProduct.price_purchase) {
                                newItems[index].price = selectedProduct.price_purchase;
                              }
                            } else {
                              newItems[index].price = "";
                            }
                            
                            setItems(newItems);
                          }}
                          className="w-full px-4 py-2.5 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                          required
                          disabled={isSubmitting}
                        >
                          <option value="">-- Chọn sản phẩm --</option>
                          {products
                            .filter((product) => {
                              // Loại trừ sản phẩm đã được chọn trong các item khác (nhưng không loại trừ item hiện tại)
                              const isAlreadySelectedInOtherItems = items.some(
                                (otherItem, otherIndex) =>
                                  otherIndex !== index &&
                                  otherItem.product_id !== "" &&
                                  otherItem.product_id !== null &&
                                  otherItem.product_id !== undefined &&
                                  Number(otherItem.product_id) === Number(product.product_id)
                              );
                              return !isAlreadySelectedInOtherItems;
                            })
                            .map((product) => (
                              <option
                                key={product.product_id}
                                value={String(product.product_id)}
                              >
                                {product.product_name || `Sản phẩm #${product.product_id}`}
                                {product.price_purchase ? ` - ${formatVND(product.price_purchase)}` : ''} 
                                (ID: {product.product_id})
                              </option>
                            ))}
                        </select>
                        {products.length === 0 && (
                          <p className="mt-1 text-xs text-gray-500">
                            Chưa có sản phẩm nào. Vui lòng tạo sản phẩm từ trang quản lý sản phẩm.
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Giá nhập (VND) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={item.price || ""}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "price",
                              e.target.value ? Number(e.target.value) : ""
                            )
                          }
                          className="w-full px-4 py-2.5 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                          placeholder="Nhập giá nhập"
                          min="0"
                          step="1000"
                          required
                        />
                        {item.price && (
                          <p className="mt-1.5 text-xs font-medium text-indigo-600">
                            {formatVND(Number(item.price))}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Số lượng <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={item.quantity || ""}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "quantity",
                              e.target.value ? Number(e.target.value) : ""
                            )
                          }
                          className="w-full px-4 py-2.5 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                          placeholder="Nhập số lượng"
                          min="1"
                          required
                        />
                      </div>
                    </div>
                    
                    {/* Thành tiền với design đẹp hơn */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">
                          Thành tiền:
                        </span>
                        <span className="text-lg font-bold text-indigo-600">
                          {item.price && item.quantity
                            ? formatVND(Number(item.price) * Number(item.quantity))
                            : "0 ₫"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 p-4 bg-indigo-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Tổng tiền:
                </span>
                <span className="text-lg font-bold text-indigo-600">
                  {formatVND(
                    items.reduce(
                      (sum, item) =>
                        sum +
                        (item.price && item.quantity
                          ? Number(item.price) * Number(item.quantity)
                          : 0),
                      0
                    )
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setOpenAddPurchaseOrder(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang xử lý..." : "Tạo phiếu nhập"}
            </button>
          </div>
        </form>
      </Dialog>

      {/* Dialog: View Details */}
      <Dialog
        open={openViewDetails}
        onClose={() => setOpenViewDetails(false)}
        title={`Chi tiếu phiếu nhập #${selectedPurchaseOrder?.purchaseorder_id}`}
        maxWidth="xl"
      >
        {isLoadingDetail ? (
          <div className="py-8 text-center text-gray-500">
            Đang tải chi tiết phiếu nhập...
          </div>
        ) : detailError ? (
          <div className="py-8 text-center">
            <p className="text-red-500 mb-2">
              Lỗi khi tải chi tiết phiếu nhập:{" "}
              {detailError instanceof Error
                ? detailError.message
                : "Lỗi không xác định"}
            </p>
            <button
              onClick={() => {
                setOpenViewDetails(false);
                setTimeout(() => {
                  setOpenViewDetails(true);
                }, 100);
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Thử lại
            </button>
          </div>
        ) : purchaseOrderDetail ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Mã phiếu nhập:
                </label>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  #{purchaseOrderDetail.purchaseorder_id}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Ngày tạo:
                </label>
                <p className="text-sm text-gray-900 mt-1">
                  {formatDate(purchaseOrderDetail.purchaseorder_date)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Nhà cung cấp:
                </label>
                <p className="text-sm text-gray-900 mt-1">
                  {purchaseOrderDetail.supplier?.supplier_name ||
                    `ID: ${purchaseOrderDetail.supplier_id}`}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Nhân viên:
                </label>
                <p className="text-sm text-gray-900 mt-1">
                  {purchaseOrderDetail.employee?.name ||
                    `ID: ${purchaseOrderDetail.employee_id}`}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Danh sách sản phẩm
                </h3>
                <PDFDownloadLink
                  document={
                    <PurchaseOrderPDFDocument detail={purchaseOrderDetail} />
                  }
                  fileName={`phieu-nhap-${purchaseOrderDetail.purchaseorder_id}.pdf`}
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
              {purchaseOrderDetail.items &&
              purchaseOrderDetail.items.length > 0 ? (
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            STT
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tên sản phẩm
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Giá nhập
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            SL
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Thành tiền
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {purchaseOrderDetail.items.map((item, index) => {
                          const total =
                            (item.price || 0) * (item.quantity || 0);
                          return (
                            <tr
                              key={item.purchaseorderdetail_id}
                              className="hover:bg-gray-50"
                            >
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                {index + 1}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center flex-shrink-0">
                                    {item.product?.thumbnail ? (
                                      <img
                                        src={item.product.thumbnail}
                                        alt={
                                          item.product?.product_name ||
                                          "Product"
                                        }
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                        onError={(e) => {
                                          // Ẩn ảnh và hiển thị placeholder khi lỗi
                                          e.currentTarget.style.display = 'none';
                                          const parent = e.currentTarget.parentElement;
                                          if (parent) {
                                            const placeholder = document.createElement('span');
                                            placeholder.className = 'text-xs text-gray-400';
                                            placeholder.textContent = 'No image';
                                            parent.appendChild(placeholder);
                                          }
                                        }}
                                      />
                                    ) : (
                                      <span className="text-xs text-gray-400">
                                        No image
                                      </span>
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-medium">
                                      {item.product?.product_name ||
                                        `Sản phẩm ID: ${item.product_id}`}
                                    </p>
                                    {item.product?.description && (
                                      <p className="text-xs text-gray-500 mt-1">
                                        {item.product.description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                                {formatVND(item.price || 0)}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                                {item.quantity || 0}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900 text-right">
                                {formatVND(total)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-4 p-4 bg-indigo-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-medium text-gray-700">
                        Tổng tiền:
                      </span>
                      <span className="text-xl font-bold text-indigo-600">
                        {formatVND(
                          purchaseOrderDetail.items.reduce(
                            (sum, item) =>
                              sum + (item.price || 0) * (item.quantity || 0),
                            0
                          )
                        )}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
                      <span>Tổng số lượng:</span>
                      <span className="font-medium">
                        {purchaseOrderDetail.items.reduce(
                          (sum, item) => sum + (item.quantity || 0),
                          0
                        )}{" "}
                        sản phẩm
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-gray-500">
                  Không có sản phẩm nào trong phiếu nhập này.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-red-500">
            Không thể tải chi tiết phiếu nhập.
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default PurchaseOrders;
