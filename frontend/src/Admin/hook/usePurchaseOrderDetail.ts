import { useQuery } from "@tanstack/react-query";

interface PurchaseOrderDetailItem {
  purchaseorderdetail_id: number;
  product_id: number;
  price: number;
  quantity: number;
  product?: {
    product_id: number;
    product_name: string;
    category_id: number;
    description: string;
    warranty_period: number;
    thumbnail?: string | null;
  };
}

interface PurchaseOrderDetail {
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
  items: PurchaseOrderDetailItem[];
}

const API_BASE = import.meta.env.VITE_API_URL;

const fetchPurchaseOrderDetail = async (
  purchaseOrderId: number
): Promise<PurchaseOrderDetail> => {
  try {
    const res = await fetch(
      `${API_BASE}/api/admin/getPurchaseOrderDetail/${purchaseOrderId}`
    );
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error("Error fetching purchase order detail:", errorData);
      throw new Error(errorData.error || "Lỗi khi tải chi tiết phiếu nhập");
    }
    const data = await res.json();
    console.log("Fetched purchase order detail:", data);
    return data;
  } catch (error) {
    console.error("Fetch purchase order detail error:", error);
    throw error;
  }
};

export const usePurchaseOrderDetail = (purchaseOrderId: number | null) => {
  return useQuery({
    queryKey: ["purchaseOrderDetail", purchaseOrderId],
    queryFn: () => fetchPurchaseOrderDetail(purchaseOrderId!),
    enabled: !!purchaseOrderId,
    staleTime: 0,
  });
};

