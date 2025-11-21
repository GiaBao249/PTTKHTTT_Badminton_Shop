import { useQuery } from "@tanstack/react-query";

interface PurchaseOrder {
  purchaseorder_id: number;
  supplier_id: number;
  employee_id: number;
  purchaseorder_date: string;
  supplier?: {
    supplier_id: number;
    supplier_name: string;
  };
  employee?: {
    employee_id: number;
    name: string;
  };
}

const API_BASE = import.meta.env.VITE_API_URL;

const fetchPurchaseOrders = async (): Promise<PurchaseOrder[]> => {
  try {
    const res = await fetch(`${API_BASE}/api/admin/getPurchaseOrders`);
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error("Lỗi khi lấy phiếu nhập:", errorData);
      throw new Error(errorData.error || "Lỗi khi tải danh sách phiếu nhập");
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Lỗi khi lấy phiếu nhập:", error);
    throw error;
  }
};

export const usePurchaseOrders = () => {
  return useQuery({
    queryKey: ["purchaseOrders"],
    queryFn: fetchPurchaseOrders,
    staleTime: 1000 * 60 * 10,
  });
};
