import { useQuery } from "@tanstack/react-query";

interface Employee {
  employee_id: number;
  name: string;
  [key: string]: any;
}

const API_BASE = import.meta.env.VITE_API_URL;

const fetchEmployees = async (): Promise<Employee[]> => {
  const res = await fetch(`${API_BASE}/api/admin/getEmployees`);
  if (!res.ok) {
    throw new Error("Lỗi khi tải danh sách nhân viên");
  }
  return res.json();
};

export const useEmployees = () => {
  return useQuery({
    queryKey: ["employees"],
    queryFn: fetchEmployees,
    staleTime: 1000 * 60 * 10,
  });
};
