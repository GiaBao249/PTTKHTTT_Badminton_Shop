import { useQuery } from "@tanstack/react-query";

interface Order {
  order_id: number;
  customer_id: number;
  status: string;
  total_amount: number;
  order_date: number;
  delivery_date: number;
  address_id: string;
}

const API_BASE = import.meta.env.VITE_API_URL;

const fetchOrders = async (): Promise<Order[]> => {
  const token = localStorage.getItem("auth_token");
  const res = await fetch(`${API_BASE}/api/admin/getOrders`, {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  if (!res.ok) {
    throw new Error("Lỗi khi tải danh sách đơn hàng");
  }
  return res.json();
};

export const useOrders = () => {
  return useQuery({
    queryKey: ["orders"],
    queryFn: fetchOrders,
    staleTime: 1000 * 60 * 5, // 5 phút
  });
};
