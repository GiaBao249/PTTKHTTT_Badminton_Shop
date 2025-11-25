import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../contexts/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL;

interface Permission {
  id: number;
  code: string;
  name: string;
  module: string;
}

const fetchPermissions = async (token: string): Promise<Permission[]> => {
  const res = await fetch(`${API_BASE}/api/admin/permissions`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Lỗi khi lấy danh sách permissions");
  }

  return res.json();
};

export const usePermissionsList = () => {
  const { token } = useAuth();

  return useQuery({
    queryKey: ["permissionsList"],
    queryFn: () => fetchPermissions(token!),
    enabled: !!token,
  });
};

export const useCreatePermission = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { code: string; name: string; module?: string }) => {
      const res = await fetch(`${API_BASE}/api/admin/permissions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Lỗi khi tạo permission");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissionsList"] });
    },
  });
};

export const useUpdatePermission = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number; code?: string; name?: string; module?: string }) => {
      const res = await fetch(`${API_BASE}/api/admin/permissions/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Lỗi khi cập nhật permission");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissionsList"] });
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
};

export const useDeletePermission = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${API_BASE}/api/admin/permissions/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Lỗi khi xóa permission");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissionsList"] });
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
};

