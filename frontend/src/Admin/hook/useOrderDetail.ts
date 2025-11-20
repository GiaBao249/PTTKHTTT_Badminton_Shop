import { useQuery } from "@tanstack/react-query";

interface OrderDetail {
    product_item_id: number;
    order_id: number;
    quantity: number;
    amount: number;
}

const API_BASE = import.meta.env.VITE_API_URL;

const fetchOrderDetails = async (orderId: number): Promise<OrderDetail[]> => {
    const res = await fetch(`${API_BASE}/api/admin/getOrdersDetail?order_id=${orderId}`);
    if (!res.ok) {
        throw new Error('Lỗi khi tải chi tiết đơn hàng');
    }
    return res.json();
};

export const useOrderDetail = (orderId: number) => {
    return useQuery({
        queryKey: ['orderDetail', orderId], 
        queryFn: () => fetchOrderDetails(orderId),
        staleTime: 1000 * 60 * 5, // 5 phút
    })
}