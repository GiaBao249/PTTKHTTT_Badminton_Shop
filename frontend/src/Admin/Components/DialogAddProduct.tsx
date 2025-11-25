import { useState, useRef } from "react";
import { Dialog } from "./DialogAddProducts";
import { useCategories } from "../hook/useCategories";
import { useSuppliers } from "../hook/useSuppliers";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

interface DialogAddProductProps {
  open: boolean;
  onClose: () => void;
}

export const DialogAddProduct = ({ open, onClose }: DialogAddProductProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const { data: categoriesData } = useCategories();
  const { data: suppliersData } = useSuppliers();
  const queryClient = useQueryClient();

  const categories = categoriesData || [];
  const suppliers = suppliersData || [];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsCreating(true);

    const formElement = e.currentTarget;

    try {
      const formData = new FormData(formElement);
      const product_name = formData.get("product_name") as string;
      const category_id = Number(formData.get("category_id"));
      const supplier_id = formData.get("supplier_id")
        ? Number(formData.get("supplier_id"))
        : null;
      const price = Number(formData.get("price"));
      const price_purchase = formData.get("price_purchase")
        ? Number(formData.get("price_purchase"))
        : null;
      const description = (formData.get("description") as string) || "";
      const warranty_period = formData.get("warranty_period")
        ? Number(formData.get("warranty_period"))
        : 0;

      // Validation
      if (!product_name || !category_id) {
        toast.warning("Vui lòng điền đầy đủ thông tin bắt buộc (tên sản phẩm và danh mục)");
        setIsCreating(false);
        return;
      }

      if (price < 0 || (price_purchase !== null && price_purchase < 0)) {
        toast.warning("Giá bán và giá nhập không được âm");
        setIsCreating(false);
        return;
      }

      const API_BASE = import.meta.env.VITE_API_URL;
      const response = await fetch(`${API_BASE}/api/admin/createProducts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_name,
          category_id,
          supplier_id,
          price,
          price_purchase,
          description,
          warranty_period,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Không thể tạo sản phẩm");
      }

      const result = await response.json();
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["productItems"] });
      
      toast.success("Tạo sản phẩm thành công!");
      
      // Reset form trước khi đóng dialog (nếu form còn tồn tại)
      try {
        if (formElement && typeof formElement.reset === "function") {
          formElement.reset();
        }
      } catch (resetError) {
        console.warn("Không thể reset form:", resetError);
      }
      
      // Close dialog sau khi reset
      setTimeout(() => {
        onClose();
      }, 200);
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra khi tạo sản phẩm");
      console.error("Error creating product:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title="Thêm sản phẩm mới" maxWidth="lg">
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tên sản phẩm <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="product_name"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Nhập tên sản phẩm"
            required
            disabled={isCreating}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Danh mục <span className="text-red-500">*</span>
            </label>
            <select
              name="category_id"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
              disabled={isCreating}
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
              Nhà cung cấp
            </label>
            <select
              name="supplier_id"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={isCreating}
            >
              <option value="">Chọn nhà cung cấp (tùy chọn)</option>
              {suppliers.map((supplier) => (
                <option key={supplier.supplier_id} value={supplier.supplier_id}>
                  {supplier.supplier_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Giá bán (VND) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="price"
              min="0"
              step="1000"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="0"
              required
              disabled={isCreating}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Giá nhập (VND)
            </label>
            <input
              type="number"
              name="price_purchase"
              min="0"
              step="1000"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="0 (tùy chọn)"
              disabled={isCreating}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mô tả sản phẩm
          </label>
          <textarea
            name="description"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            placeholder="Nhập mô tả sản phẩm (tùy chọn)"
            disabled={isCreating}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Thời gian bảo hành (tháng)
          </label>
          <input
            type="number"
            name="warranty_period"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="0"
            defaultValue={0}
            disabled={isCreating}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={isCreating}
          >
            Hủy
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled={isCreating}
          >
            {isCreating ? "Đang tạo..." : "Tạo sản phẩm"}
          </button>
        </div>
      </form>
    </Dialog>
  );
};

