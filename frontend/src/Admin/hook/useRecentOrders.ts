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

const fetchRecentOrders = async (): Promise<Order[]> => {
    const res = await fetch(`${API_BASE}/api/admin/getRecentOrders`);
    if (!res.ok) {
        throw new Error('Lỗi khi tải danh sách đơn hàng gần đây');
    }
    return res.json();
};

export const useRecentOrders = () => {
    return useQuery({
        queryKey: ['recentOrders'], 
        queryFn: fetchRecentOrders,
        staleTime: 1000 * 60 * 5, // 5 phút
    })
}