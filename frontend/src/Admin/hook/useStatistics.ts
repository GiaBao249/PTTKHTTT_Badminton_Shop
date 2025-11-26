import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../contexts/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL;

interface RevenueStats {
  revenue: Record<string, number>;
  orderCount: Record<string, number>;
  period: string;
}

interface ProductStats {
  totalProducts: number;
  totalQuantity: number;
  outOfStockProducts: number;
  inStockProducts: number;
}

interface OrderStats {
  statusCount: Record<string, number>;
  statusRevenue: Record<string, number>;
  totalOrders: number;
}

interface SummaryStats {
  totalOrders: number;
  completedOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  totalProducts: number;
  totalPurchaseOrders: number;
  period: { startDate: string; endDate: string } | null;
}

export const useRevenueStatistics = (period: "day" | "week" | "month" | "year" = "month") => {
  const { token } = useAuth();

  return useQuery({
    queryKey: ["statistics", "revenue", period],
    queryFn: async (): Promise<RevenueStats> => {
      const res = await fetch(`${API_BASE}/api/admin/statistics/revenue?period=${period}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!res.ok) {
        throw new Error("Lỗi khi lấy thống kê doanh thu");
      }

      return res.json();
    },
    enabled: !!token,
  });
};

export const useProductStatistics = () => {
  const { token } = useAuth();

  return useQuery({
    queryKey: ["statistics", "products"],
    queryFn: async (): Promise<ProductStats> => {
      const res = await fetch(`${API_BASE}/api/admin/statistics/products`, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!res.ok) {
        throw new Error("Lỗi khi lấy thống kê sản phẩm");
      }

      return res.json();
    },
    enabled: !!token,
  });
};

export const useOrderStatistics = () => {
  const { token } = useAuth();

  return useQuery({
    queryKey: ["statistics", "orders"],
    queryFn: async (): Promise<OrderStats> => {
      const res = await fetch(`${API_BASE}/api/admin/statistics/orders`, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!res.ok) {
        throw new Error("Lỗi khi lấy thống kê đơn hàng");
      }

      return res.json();
    },
    enabled: !!token,
  });
};

export const useSummaryStatistics = (startDate?: string, endDate?: string) => {
  const { token } = useAuth();

  return useQuery({
    queryKey: ["statistics", "summary", startDate, endDate],
    queryFn: async (): Promise<SummaryStats> => {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const res = await fetch(
        `${API_BASE}/api/admin/statistics/summary?${params.toString()}`,
        {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );

      if (!res.ok) {
        throw new Error("Lỗi khi lấy thống kê tổng hợp");
      }

      return res.json();
    },
    enabled: !!token,
  });
};

