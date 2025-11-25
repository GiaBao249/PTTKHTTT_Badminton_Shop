import { useQuery } from "@tanstack/react-query";

interface Customer {
    customer_id: number;
    customer_name: string;
    customer_gender: string;
    customer_phone: string;
    customer_email: string;
    created_at?: string;
    total_orders?: number;
    total_spent?: number;
}

const API_BASE = import.meta.env.VITE_API_URL;

const fetchCustomers = async (): Promise<Customer[]> => {
    const token = localStorage.getItem("auth_token");
    const res = await fetch(`${API_BASE}/api/admin/getCustomers`, {
        headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
        },
    });
    if (!res.ok) {
        throw new Error('Lỗi khi tải danh sách khách hàng');
    }
    return res.json();
};

export const useCustomers = () => {
    return useQuery({
        queryKey: ['customers'], 
        queryFn: fetchCustomers,
        staleTime: 1000 * 60 * 5, // 5 phút
    })
}