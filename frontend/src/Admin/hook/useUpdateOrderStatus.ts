import { useMutation, useQueryClient } from "@tanstack/react-query";

const API_BASE = import.meta.env.VITE_API_URL;

interface UpdateOrderStatusParams {
    order_id: number;
    status: string;
}

interface Order {
    order_id: number;
    customer_id: number;
    status: string;
    total_amount: number;
    order_date: number;
    delivery_date: number;
    address_id: string;
}

const updateOrderStatus = async ({ order_id, status }: UpdateOrderStatusParams) => {
    const res = await fetch(`${API_BASE}/api/admin/updateOrderStatus`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ order_id, status }),
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Lỗi cập nhật trạng thái');
    }

    return res.json();
};

export const useUpdateOrderStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateOrderStatus,
        onSuccess: (data, variables) => {
            // Cách 1: Invalidates query để fetch lại dữ liệu mới
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            
            // Cách 2: Cập nhật cache ngay lập tức không cần fetch lại
            queryClient.setQueryData(['orders'], (oldData: Order[] | undefined) => {
                if (!oldData) return oldData;
                return oldData.map(order => 
                    order.order_id === variables.order_id 
                        ? { ...order, status: variables.status }
                        : order
                );
            });
        },
    });
};