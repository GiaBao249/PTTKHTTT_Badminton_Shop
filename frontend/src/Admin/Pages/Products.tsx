import { useEffect, useState } from "react";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { Dialog, DialogEditProduct, DialogDeleteConfirm } from "../Components";
const Products = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [openAddProducts, setOpenAddProduct] = useState(false);
  const [openEditProduct, setOpenEditProduct] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{
    product_id: number;
    supplier_id: number;
    category_id: number;
    product_name: string;
    price: number;
    description: string;
    warranty_period: number;
  } | null>(null);

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
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsItem, setProductItem] = useState<ProductItem[]>([]);

  const API_BASE = import.meta.env.VITE_API_URL
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const [productsRes, productItemRes] = await Promise.all([
          fetch(`${API_BASE}/api/admin/getProducts`).then(res => res.json()),
          fetch(`${API_BASE}/api/admin/getProductsItem`).then(res => res.json()),
        ]);
        
        setProducts(productsRes);
        setProductItem(productItemRes);
      } catch (error) {
        console.error("Lỗi khi fetch sản phẩm:", error);
      }
    }
    fetchProducts();
  });

  const formatVND = (v: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(v);

  const filteredProducts = products.filter((p) =>
    p.product_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    // TODO: Gọi API xóa sản phẩm
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setProducts(products.filter((p) => p.product_id !== selectedProduct.product_id));
    setIsDeleting(false);
    setOpenDeleteConfirm(false);
    setSelectedProduct(null);
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
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option>Tất cả danh mục</option>
            <option>Vợt</option>
            <option>Quần áo</option>
            <option>Giày</option>
            <option>Phụ kiện</option>
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
              {filteredProducts.map((product) => (
                <tr key={product.product_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg" />
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {productsItem.find(pi => pi.product_id === product.product_id)?.quantity || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-block px-2 py-1 text-xs rounded-full ${
                        (productsItem.find(pi => pi.product_id === product.product_id)?.quantity || 0 > 0 ? "Còn hàng" : "Hết hàng") === "Còn hàng"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {productsItem.find(pi => pi.product_id === product.product_id)?.quantity || 0 > 0 ? "Còn hàng" : "Hết hàng"}
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
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
          <p className="text-sm text-gray-700">
            Hiển thị <span className="font-medium">1</span> đến{" "}
            <span className="font-medium">{filteredProducts.length}</span> trong
            tổng số <span className="font-medium">{products.length}</span> sản
            phẩm
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
                type=""
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Nhập giá"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số lượng cần mua
              </label>
              <input
                type=""
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
              defaultValue={selectedProduct?.product_name || ""}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Nhập tên sản phẩm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Danh mục sản phẩm
            </label>
            <select
              defaultValue={selectedProduct?.category_id || ""}
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
                type=""
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
                type=""
                defaultValue={productsItem.find(pi => pi.product_id === selectedProduct?.product_id)?.quantity || 0}
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
        itemName={selectedProduct?.product_name}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Products;
