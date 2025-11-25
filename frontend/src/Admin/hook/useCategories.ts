import { useQuery } from "@tanstack/react-query";

interface Category {
  category_id: number;
  category_name: string;
}

const API_BASE = import.meta.env.VITE_API_URL;

const fetchCategories = async (): Promise<Category[]> => {
  const token = localStorage.getItem("auth_token");
  const res = await fetch(`${API_BASE}/api/admin/getCategories`, {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  if (!res.ok) {
    throw new Error("Lỗi khi tải danh sách danh mục");
  }
  return res.json();
};

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 10,
  });
};
