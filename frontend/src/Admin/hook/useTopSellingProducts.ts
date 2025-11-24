import { useQuery } from "@tanstack/react-query";

interface TopSellingProduct {
  product_id: number;
  product_name: string;
  price: number;
  sold_quantity: number;
  thumbnail?: string | null;
}

const API_BASE = import.meta.env.VITE_API_URL;

const fetchTopSellingProducts = async (
  limit: number = 5
): Promise<TopSellingProduct[]> => {
  const res = await fetch(
    `${API_BASE}/api/admin/getTopSellingProducts?limit=${limit}`
  );
  if (!res.ok) {
    throw new Error("Lỗi khi tải sản phẩm bán chạy");
  }
  return res.json();
};

export const useTopSellingProducts = (limit: number = 5) => {
  return useQuery({
    queryKey: ["topSellingProducts", limit],
    queryFn: () => fetchTopSellingProducts(limit),
    staleTime: 1000 * 60 * 5,
  });
};
