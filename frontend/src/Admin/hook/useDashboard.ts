import { useQuery } from "@tanstack/react-query";

const API_BASE = import.meta.env.VITE_API_URL;

interface DashBoardStats {
    totalOrders: number;
    totalCustomers: number;
    totalProducts: number;
    totalRevenue: number;
}

const fetchDashBoardStats = async (): Promise<DashBoardStats> => {
    const res = await fetch(`${API_BASE}/api/admin/getDashBoardStats`);
    if (!res.ok) {
        throw new Error('Lỗi khi tải số liệu tổng quan');
    }   
    return res.json();
};

export const useDashBoard = () => {
    return useQuery({
        queryKey: ['dashboardStats'], 
        queryFn: fetchDashBoardStats,
        staleTime: 1000 * 60 * 5, // 5 phút
    })
}