import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../contexts/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL;

interface Permission {
  id: number;
  code: string;
  name: string;
  module: string;
}

interface Role {
  id: number;
  name: string;
  description: string;
  permissions: Permission[];
}

const fetchRoles = async (token: string): Promise<Role[]> => {
  const res = await fetch(`${API_BASE}/api/admin/roles`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Lỗi khi lấy danh sách roles");
  }

  return res.json();
};

export const useRoles = () => {
  const { token } = useAuth();

  return useQuery({
    queryKey: ["roles"],
    queryFn: () => fetchRoles(token!),
    enabled: !!token,
  });
};

export const useCreateRole = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; description?: string; permission_ids?: number[] }) => {
      const res = await fetch(`${API_BASE}/api/admin/roles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Lỗi khi tạo role");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
};

export const useUpdateRole = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number; name?: string; description?: string; permission_ids?: number[] }) => {
      const res = await fetch(`${API_BASE}/api/admin/roles/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Lỗi khi cập nhật role");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
    },
  });
};

export const useDeleteRole = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${API_BASE}/api/admin/roles/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Lỗi khi xóa role");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
};
