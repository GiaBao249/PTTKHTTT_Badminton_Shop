import { useState, useRef, useEffect } from "react";
import { Dialog } from "./DialogAddProducts";
import { useCategories } from "../hook/useCategories";
import { useSuppliers } from "../hook/useSuppliers";
import { useVariations } from "../hook/useVariations";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Plus, X } from "lucide-react";

interface DialogAddProductProps {
  open: boolean;
  onClose: () => void;
}

interface ProductItem {
  variation_option_ids: number[];
}

export const DialogAddProduct = ({ open, onClose }: DialogAddProductProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedVariations, setSelectedVariations] = useState<Record<number, number[]>>({});
  const [productItems, setProductItems] = useState<ProductItem[]>([]);
  const formRef = useRef<HTMLFormElement>(null);
  const { data: categoriesData } = useCategories();
  const { data: suppliersData } = useSuppliers();
  const { data: variationsData, isLoading: variationsLoading } = useVariations(selectedCategoryId);
  const queryClient = useQueryClient();

  const categories = categoriesData || [];
  const suppliers = suppliersData || [];
  const variations = variationsData || [];

  // Generate product items from selected variations
  useEffect(() => {
    // Skip nếu đang loading hoặc chưa có selectedCategoryId
    if (variationsLoading || !selectedCategoryId) {
      if (!selectedCategoryId && productItems.length > 0) {
        setProductItems([]);
      }
      return;
    }

    // Nếu không có variations, tạo một item rỗng
    if (variations.length === 0) {
      const hasEmptyItem = productItems.length === 1 && productItems[0].variation_option_ids.length === 0;
      if (!hasEmptyItem) {
        setProductItems([{ variation_option_ids: [] }]);
      }
      return;
    }

    const selectedOptions: number[][] = [];
    variations.forEach((variation) => {
      const selected = selectedVariations[variation.variation_id] || [];
      if (selected.length > 0) {
        selectedOptions.push(selected);
      }
    });

    // If no variations selected, create one empty item
    if (selectedOptions.length === 0) {
      const hasEmptyItem = productItems.length === 1 && productItems[0].variation_option_ids.length === 0;
      if (!hasEmptyItem) {
        setProductItems([{ variation_option_ids: [] }]);
      }
      return;
    }

    // Generate all combinations
    const combinations: number[][] = [];
    function generateCombinations(index: number, current: number[]) {
      if (index === selectedOptions.length) {
        combinations.push([...current]);
        return;
      }
      selectedOptions[index].forEach((optionId) => {
        generateCombinations(index + 1, [...current, optionId]);
      });
    }
    generateCombinations(0, []);

    // Create product items from combinations
    const newItems: ProductItem[] = combinations.map((combo) => ({
      variation_option_ids: combo,
    }));

    // Chỉ update nếu có thay đổi thực sự
    setProductItems((prev) => {
      const prevStr = JSON.stringify(prev);
      const newStr = JSON.stringify(newItems);
      return prevStr === newStr ? prev : newItems;
    });
  }, [selectedVariations, variationsData, selectedCategoryId, variationsLoading]);

  const handleVariationOptionChange = (variationId: number, optionId: number, checked: boolean) => {
    setSelectedVariations((prev) => {
      const current = prev[variationId] || [];
      if (checked) {
        return { ...prev, [variationId]: [...current, optionId] };
      } else {
        return { ...prev, [variationId]: current.filter((id) => id !== optionId) };
      }
    });
  };

  const handleAddItem = () => {
    setProductItems((prev) => [...prev, { variation_option_ids: [] }]);
  };

  const handleRemoveItem = (index: number) => {
    setProductItems((prev) => prev.filter((_, i) => i !== index));
  };

  const getVariationOptionLabel = (optionId: number): string => {
    for (const variation of variations) {
      const option = variation.variation_options.find((opt) => opt.variation_option_id === optionId);
      if (option) {
        return `${variation.name}: ${option.value}`;
      }
    }
    return `Option ${optionId}`;
  };

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

      // Chuẩn bị items - nếu không có items nào thì tạo một item rỗng
      let itemsToSend = productItems;
      if (itemsToSend.length === 0) {
        itemsToSend = [{ variation_option_ids: [] }];
      }

      const API_BASE = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${API_BASE}/api/admin/createProducts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          product_name,
          category_id,
          supplier_id,
          price,
          price_purchase,
          description,
          warranty_period,
          items: itemsToSend.map((item) => ({
            variation_option_ids: item.variation_option_ids || [],
          })),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Không thể tạo sản phẩm");
      }

      await response.json();

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["productItems"] });

      toast.success("Tạo sản phẩm thành công!");

      // Reset form
      try {
        if (formElement && typeof formElement.reset === "function") {
          formElement.reset();
        }
      } catch (resetError) {
        console.warn("Không thể reset form:", resetError);
      }

      setSelectedCategoryId(null);
      setSelectedVariations({});
      setProductItems([]);

      // Close dialog after reset
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

  const handleCategoryChange = (categoryId: number | null) => {
    setSelectedCategoryId(categoryId);
    setSelectedVariations({});
    setProductItems([]);
  };

  return (
    <Dialog open={open} onClose={onClose} title="Thêm sản phẩm mới" maxWidth="xl">
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
        {/* Thông tin cơ bản */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Thông tin cơ bản</h3>

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
                onChange={(e) => {
                  const categoryId = e.target.value ? Number(e.target.value) : null;
                  handleCategoryChange(categoryId);
                }}
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
        </div>

        {/* Phần variations và product items - chỉ hiển thị khi đã chọn category */}
        {selectedCategoryId && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Biến thể sản phẩm</h3>

            {/* Chọn variations */}
            {variations.length > 0 ? (
              <div className="space-y-4">
                {variations.map((variation) => (
                  <div key={variation.variation_id} className="p-4 bg-gray-50 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {variation.name}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {variation.variation_options.map((option) => (
                        <label
                          key={option.variation_option_id}
                          className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={
                              (selectedVariations[variation.variation_id] || []).includes(
                                option.variation_option_id
                              )
                            }
                            onChange={(e) =>
                              handleVariationOptionChange(
                                variation.variation_id,
                                option.variation_option_id,
                                e.target.checked
                              )
                            }
                            className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                            disabled={isCreating}
                          />
                          <span className="text-sm text-gray-700">{option.value}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                {variationsData === undefined ? "Đang tải các biến thể..." : "Danh mục này chưa có biến thể"}
              </p>
            )}

            {/* Danh sách product items */}
            {productItems.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-md font-medium text-gray-900">
                    Các biến thể sản phẩm
                    {productItems.some((item) => item.variation_option_ids.length === 0) && (
                      <span className="ml-2 text-xs font-normal text-gray-500">
                        (Có thể tạo sản phẩm không có biến thể)
                      </span>
                    )}
                  </h4>
                  {variations.length > 0 && (
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      disabled={isCreating}
                    >
                      <Plus size={16} />
                      Thêm biến thể
                    </button>
                  )}
                </div>

                {productItems.map((item, index) => (
                  <div
                    key={index}
                    className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-indigo-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-700 mb-2">
                          Biến thể #{index + 1}
                        </div>
                        {item.variation_option_ids.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {item.variation_option_ids.map((optionId) => (
                              <span
                                key={optionId}
                                className="px-2 py-1 text-xs bg-indigo-100 text-indigo-700 rounded"
                              >
                                {getVariationOptionLabel(optionId)}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-500">
                            Biến thể đơn (không có thuộc tính cụ thể)
                          </p>
                        )}
                      </div>
                      {productItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                          disabled={isCreating}
                        >
                          <X size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

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
