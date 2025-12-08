import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../contexts/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL;

interface AdminAccount {
  id: number;
  username: string;
  employee_id: number;
  employee?: {
    name: string;
  };
}

const fetchAdminAccounts = async (token: string): Promise<AdminAccount[]> => {
  const res = await fetch(`${API_BASE}/api/admin/adminAccounts`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Lỗi khi lấy danh sách admin");
  }

  return res.json();
};

export const useAdminAccounts = () => {
  const { token } = useAuth();

  return useQuery({
    queryKey: ["adminAccounts"],
    queryFn: () => fetchAdminAccounts(token!),
    enabled: !!token,
  });
};

export const useAdminRoles = (adminId?: number) => {
  const { token } = useAuth();

  return useQuery({
    queryKey: ["adminRoles", adminId],
    queryFn: async () => {
      if (!adminId) return [];
      const res = await fetch(`${API_BASE}/api/admin/admin/${adminId}/roles`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Lỗi khi lấy roles của admin");
      }

      return res.json();
    },
    enabled: !!token && !!adminId,
  });
};

export const useAssignRolesToAdmin = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ adminId, role_ids }: { adminId: number; role_ids: number[] }) => {
      const res = await fetch(`${API_BASE}/api/admin/admin/${adminId}/roles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role_ids }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Lỗi khi gán roles cho admin");
      }

      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["adminRoles", variables.adminId] });
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
    },
  });
};

