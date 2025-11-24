import { useQuery } from "@tanstack/react-query";

interface Supplier {
  supplier_id: number;
  supplier_name: string;
  [key: string]: any;
}

const API_BASE = import.meta.env.VITE_API_URL;

const fetchSuppliers = async (): Promise<Supplier[]> => {
  const res = await fetch(`${API_BASE}/api/admin/getSuppliers`);
  if (!res.ok) {
    throw new Error("Lỗi khi tải danh sách nhà cung cấp");
  }
  return res.json();
};

export const useSuppliers = () => {
  return useQuery({
    queryKey: ["suppliers"],
    queryFn: fetchSuppliers,
    staleTime: 1000 * 60 * 10,
  });
};
