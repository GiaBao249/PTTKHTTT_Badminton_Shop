import { useState } from "react";
import { Search, Edit, Trash2 } from "lucide-react";
import { DialogEditProduct, DialogDeleteConfirm } from "../Components";
import { useProducts } from "../hook/useProducts";
import { useProductItems } from "../hook/useProductItems";
import { useCategories } from "../hook/useCategories";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

const Products = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | "">("");
  const [openEditProduct, setOpenEditProduct] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedProduct, setSelectedProduct] = useState<{
    product_id: number;
    supplier_id: number;
    category_id: number;
    product_name: string;
    price: number;
    description: string;
    warranty_period: number;
  } | null>(null);

  const [isDeleting, setIsDeleting] = useState(false);

  const {
    data: productsData,
    refetch: refetchProducts,
    isLoading,
    error,
  } = useProducts();
  const { data: productItemsData, refetch: refetchProductItems } =
    useProductItems();
  const { data: categoriesData } = useCategories();
  const queryClient = useQueryClient();

  const products = productsData || [];
  const productsItem = productItemsData || [];
  const categories = categoriesData || [];

  const formatVND = (v: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(v);

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.product_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      !selectedCategoryId || p.category_id === selectedCategoryId;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const handleEdit = (product: (typeof products)[0]) => {
    setSelectedProduct(product);
    setOpenEditProduct(true);
  };

  const handleDeleteClick = (product: (typeof products)[0]) => {
    setSelectedProduct(product);
    setOpenDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProduct) return;
    setIsDeleting(true);
    try {
      const API_BASE = import.meta.env.VITE_API_URL;
      const response = await fetch(
        `${API_BASE}/api/admin/deleteProduct/${selectedProduct.product_id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Không thể xóa sản phẩm");
      }

      toast.success("Xóa sản phẩm thành công!");
      setOpenDeleteConfirm(false);
      setSelectedProduct(null);
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["productItems"] });
      await Promise.all([refetchProducts(), refetchProductItems()]);
    } catch (error: any) {
      toast.warning(error.message || "Có lỗi xảy ra khi xóa sản phẩm");
      console.error("Error deleting product:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const formData = new FormData(e.currentTarget);
    const product_name = formData.get("product_name") as string;
    const category_id = Number(formData.get("category_id"));
    const price = Number(formData.get("price"));

    if (!product_name || !category_id || !price || price <= 0) {
      toast.warning("Vui lòng điền đầy đủ thông tin hợp lệ");
      return;
    }

    setIsUpdating(true);
    try {
      const API_BASE = import.meta.env.VITE_API_URL;
      const response = await fetch(
        `${API_BASE}/api/admin/updateProduct/${selectedProduct.product_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            product_name,
            category_id,
            price,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Không thể cập nhật sản phẩm");
      }

      toast.success("Cập nhật sản phẩm thành công!");
      setOpenEditProduct(false);
      setSelectedProduct(null);
      queryClient.invalidateQueries({ queryKey: ["products"] });
      await refetchProducts();
    } catch (error: any) {
      toast.warning(error.message || "Có lỗi xảy ra khi cập nhật sản phẩm");
      console.error("Error updating product:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý sản phẩm</h1>
          <p className="text-gray-600 mt-1">
            Quản lý danh sách sản phẩm trong cửa hàng
          </p>
        </div>
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
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                handleFilterChange();
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            value={selectedCategoryId}
            onChange={(e) => {
              setSelectedCategoryId(
                e.target.value === "" ? "" : Number(e.target.value)
              );
              handleFilterChange();
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((category) => (
              <option key={category.category_id} value={category.category_id}>
                {category.category_name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sản phẩm
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Danh mục
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Giá bán
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Giá nhập
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tồn kho
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
              {isLoading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    Đang tải danh sách sản phẩm...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-red-500"
                  >
                    Lỗi khi tải danh sách sản phẩm:{" "}
                    {error instanceof Error
                      ? error.message
                      : "Lỗi không xác định"}
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    Không tìm thấy sản phẩm nào
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((product) => (
                  <tr key={product.product_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
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
                            <span className="text-xs text-gray-500">
                              No image
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {product.product_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            ID: #{product.product_id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                        {product.category_id}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {formatVND(product.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {product.price_purchase
                        ? formatVND(product.price_purchase)
                        : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {productsItem.find(
                        (pi) => pi.product_id === product.product_id
                      )?.quantity || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded-full ${
                          (productsItem.find(
                            (pi) => pi.product_id === product.product_id
                          )?.quantity || 0 > 0
                            ? "Còn hàng"
                            : "Hết hàng") === "Còn hàng"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {productsItem.find(
                          (pi) => pi.product_id === product.product_id
                        )?.quantity || 0 > 0
                          ? "Còn hàng"
                          : "Hết hàng"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Sửa sản phẩm"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(product)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa sản phẩm"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
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
              {filteredProducts.length > 0 ? startIndex + 1 : 0}
            </span>{" "}
            đến{" "}
            <span className="font-medium">
              {Math.min(endIndex, filteredProducts.length)}
            </span>{" "}
            trong tổng số{" "}
            <span className="font-medium">{filteredProducts.length}</span> sản
            phẩm
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Trước
            </button>
            <div className="flex items-center gap-1">
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
            </div>
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
      </div>
      <DialogEditProduct
        open={openEditProduct}
        onClose={() => {
          setOpenEditProduct(false);
          setSelectedProduct(null);
        }}
        title="Sửa sản phẩm"
        maxWidth="lg"
      >
        <form onSubmit={handleUpdateProduct} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên sản phẩm <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="product_name"
              defaultValue={selectedProduct?.product_name || ""}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Nhập tên sản phẩm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Danh mục sản phẩm <span className="text-red-500">*</span>
            </label>
            <select
              name="category_id"
              defaultValue={selectedProduct?.category_id || ""}
              className="px-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="">Chọn danh mục</option>
              {categories.map((category) => (
                <option key={category.category_id} value={category.category_id}>
                  {category.category_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Giá bán <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="price"
              defaultValue={selectedProduct?.price || 0}
              min="0"
              step="1000"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Nhập giá bán"
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setOpenEditProduct(false);
                setSelectedProduct(null);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={isUpdating}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isUpdating}
            >
              {isUpdating ? "Đang cập nhật..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </DialogEditProduct>

      <DialogDeleteConfirm
        open={openDeleteConfirm}
        onClose={() => {
          setOpenDeleteConfirm(false);
          setSelectedProduct(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Xác nhận xóa sản phẩm"
        message="Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn tác."
        itemName={selectedProduct?.product_name}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Products;
