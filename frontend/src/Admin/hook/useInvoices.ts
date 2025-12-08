import { useQuery } from "@tanstack/react-query";

interface Invoice {
  order_id: number;
  customer_id: number;
  status: string;
  total_amount: number;
  order_date: string;
  delivery_date: string | null;
  address_id: number;
  customer?: {
    customer_id: number;
    customer_name: string;
    customer_phone: string;
    customer_email?: string;
  };
  orderdetail?: Array<{
    order_id: number;
    product_item_id: number;
    quantity: number;
    amount: number;
    product_item?: {
      product_item_id: number;
      product_id: number;
      product?: {
        product_id: number;
        product_name: string;
        price: number;
        thumbnail?: string | null;
        category?: {
          category_id: number;
          category_name: string;
        };
      };
    };
  }>;
}

interface UseInvoicesParams {
  startDate?: string;
  endDate?: string;
  status?: string;
}

const API_BASE = import.meta.env.VITE_API_URL;

const fetchInvoices = async (
  params?: UseInvoicesParams
): Promise<Invoice[]> => {
  const token = localStorage.getItem("auth_token");
  const queryParams = new URLSearchParams();
  if (params?.startDate) queryParams.append("startDate", params.startDate);
  if (params?.endDate) queryParams.append("endDate", params.endDate);
  if (params?.status) queryParams.append("status", params.status);

  const response = await fetch(
    `${API_BASE}/api/admin/getInvoices?${queryParams}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to fetch invoices");
  }
  return response.json();
};

export const useInvoices = (params?: UseInvoicesParams) => {
  return useQuery({
    queryKey: ["invoices", params],
    queryFn: () => fetchInvoices(params),
    staleTime: 1000 * 60 * 5, // 5 phút
  });
};

export type { Invoice };
