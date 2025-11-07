import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Dialog, DialogEditProduct, DialogDeleteConfirm } from "../Components";
const Products = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [openAddProducts, setOpenAddProduct] = useState(false);
  const [openEditProduct, setOpenEditProduct] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<{
    id: number;
    name: string;
    category: string;
    price: number;
    stock: number;
    status: string;
  } | null>(null);
  const API_BASE = import.meta.env.VITE_API_URL;
  const [isDeleting, setIsDeleting] = useState(false);

  const [products, setProducts] = useState<
    {
      id: number;
      name: string;
      category: string;
      price: number;
      stock: number;
      status: string;
    }[]
  >([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Số sản phẩm mỗi trang

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE}/api/admin/products`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        throw new Error("Không thể tải danh sách sản phẩm");
      }
      // chuyen thanh frontend
      const data = await res.json();
      const mappedProducts = data.map((p: any) => ({
        id: p.product_id,
        name: p.product_name,
        category: p.category?.category_name,
        price: p.price || 0,
        stock: p.inStock || 0,
        status: (p.inStock || 0) > 0 ? "Còn hàng" : "Hết hàng",
      }));
      setProducts(mappedProducts);
    } catch (error) {
      setError("Có lỗi xảy ra khai lấy sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const formatVND = (v: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(v);

  const handleEdit = (product: (typeof products)[0]) => {
    setSelectedProduct(product);
    setOpenEditProduct(true);
  };

  const categorySet = Array.from(
    new Set(products.map((p) => p.category).filter(Boolean))
  ).sort();
  const categories = useMemo(() => {
    return Array.from(categorySet);
  }, [products]);

  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const handlePageChange = (pageNumber: number) => {
    const next = Math.min(Math.max(pageNumber, 1), totalPages);
    setCurrentPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  const handleDeleteClick = (product: (typeof products)[0]) => {
    setSelectedProduct(product);
    setOpenDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProduct) return;
    setIsDeleting(true);
    // TODO: Gọi API xóa sản phẩm
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setProducts(products.filter((p) => p.id !== selectedProduct.id));
    setIsDeleting(false);
    setOpenDeleteConfirm(false);
    setSelectedProduct(null);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý sản phẩm</h1>
          <p className="text-gray-600 mt-1">
            Quản lý danh sách sản phẩm trong cửa hàng
          </p>
        </div>
        <button
          onClick={() => setOpenAddProduct(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus size={20} />
          Thêm sản phẩm
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
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Tất cả danh mục</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
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
                  Giá
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
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <p className="text-gray-500">Không có sản phẩm nào</p>
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            ID: #{product.id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {formatVND(product.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.stock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded-full ${
                          product.status === "Còn hàng"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {product.status}
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
            Hiển thị <span className="font-medium">{startIndex + 1}</span> đến{" "}
            <span className="font-medium">
              {Math.min(endIndex, filteredProducts.length)}
            </span>{" "}
            trong tổng số{" "}
            <span className="font-medium">{filteredProducts.length}</span> sản
            phẩm
          </p>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
              >
                <ChevronLeft size={16} />
                <span>Trước</span>
              </button>

              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`min-w-[36px] h-[36px] px-3 py-1 rounded-lg text-sm border transition-colors ${
                        currentPage === page
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
              >
                <span>Sau</span>
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
      {/* Dialog Thêm sản phẩm */}
      <Dialog
        open={openAddProducts}
        onClose={() => setOpenAddProduct(false)}
        title="Thêm sản phẩm mới"
        maxWidth="lg"
      >
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên sản phẩm
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Nhập tên sản phẩm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Danh mục sản phẩm
            </label>
            <select className="px-4 py-2 w-full  border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option>Danh mục sản phẩm</option>
              <option>Vợt</option>
              <option>Quần áo</option>
              <option>Giày</option>
              <option>Phụ kiện</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4 items-center justify-center">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giá
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Nhập giá"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số lượng cần mua
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Nhập số lượng"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nhà cung cấp
            </label>
            <select className="px-4 py-2 border border-gray-300 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option>Chọn nhà cung cấp</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setOpenAddProduct(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Thêm sản phẩm
            </button>
          </div>
        </form>
      </Dialog>

      {/* Dialog Sửa sản phẩm */}
      <DialogEditProduct
        open={openEditProduct}
        onClose={() => {
          setOpenEditProduct(false);
          setSelectedProduct(null);
        }}
        title="Sửa sản phẩm"
        maxWidth="lg"
      >
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên sản phẩm
            </label>
            <input
              type="text"
              defaultValue={selectedProduct?.name || ""}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Nhập tên sản phẩm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Danh mục sản phẩm
            </label>
            <select
              defaultValue={selectedProduct?.category || ""}
              className="px-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option>Danh mục sản phẩm</option>
              <option>Vợt</option>
              <option>Quần áo</option>
              <option>Giày</option>
              <option>Phụ kiện</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giá
              </label>
              <input
                type="number"
                defaultValue={selectedProduct?.price || 0}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Nhập giá"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tồn kho
              </label>
              <input
                type="number"
                defaultValue={selectedProduct?.stock || 0}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Nhập số lượng"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setOpenEditProduct(false);
                setSelectedProduct(null);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Lưu thay đổi
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
        itemName={selectedProduct?.name}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Products;
