import { useQuery } from "@tanstack/react-query";
import { type Invoice } from "./useInvoices";

const API_BASE = import.meta.env.VITE_API_URL;

const fetchInvoice = async (orderId: number): Promise<Invoice> => {
  const token = localStorage.getItem("auth_token");
  const response = await fetch(`${API_BASE}/api/admin/getInvoice/${orderId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to fetch invoice");
  }
  return response.json();
};

export const useInvoice = (orderId: number | null) => {
  return useQuery({
    queryKey: ["invoice", orderId],
    queryFn: () => fetchInvoice(orderId!),
    enabled: !!orderId,
    staleTime: 1000 * 60 * 5, // 5 phút
  });
};
