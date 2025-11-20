import { useQuery } from '@tanstack/react-query';

interface Product {
  product_id: number;
  supplier_id: number;
  category_id: number;
  product_name: string;
  price: number;
  description: string;
  warranty_period: number;
}

const API_BASE = import.meta.env.VITE_API_URL;

const fetchProducts = async (): Promise<Product[]> => {
  const res = await fetch( `${API_BASE}/api/admin/getProducts`);
  if (!res.ok) {
    throw new Error('Lỗi khi tải danh sách sản phẩm');
  }
  return res.json();
};

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'], 
    queryFn: fetchProducts,
    staleTime: 1000 * 60 * 5, // 5 phút
  });
};