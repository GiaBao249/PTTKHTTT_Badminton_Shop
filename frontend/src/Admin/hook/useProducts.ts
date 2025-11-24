import { useQuery } from "@tanstack/react-query";

interface Product {
  product_id: number;
  supplier_id: number;
  category_id: number;
  product_name: string;
  price: number;
  price_purchase?: number;
  description: string;
  warranty_period: number;
  thumbnail?: string | null;
}

const API_BASE = import.meta.env.VITE_API_URL;

const fetchProducts = async (): Promise<Product[]> => {
  const res = await fetch(`${API_BASE}/api/admin/getProducts`);
  if (!res.ok) {
    throw new Error("Lỗi khi tải danh sách sản phẩm");
  }
  return res.json();
};

export const useProducts = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
};
