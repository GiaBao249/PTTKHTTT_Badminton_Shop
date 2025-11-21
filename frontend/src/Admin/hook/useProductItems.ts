import { useQuery } from "@tanstack/react-query";

interface ProductItem {
  product_item_id: number;
  product_id: number;
  quantity: number;
}

const API_BASE = import.meta.env.VITE_API_URL;

const fetchProductItems = async (): Promise<ProductItem[]> => {
  const res = await fetch(`${API_BASE}/api/admin/getProductsItem`);
  if (!res.ok) {
    throw new Error("Lỗi khi tải danh sách mục sản phẩm");
  }
  return res.json();
};

export const useProductItems = () => {
  return useQuery({
    queryKey: ["productItems"],
    queryFn: fetchProductItems,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
};
