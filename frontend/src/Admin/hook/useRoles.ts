import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";

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

const API_BASE = import.meta.env.VITE_API_URL;

const fetchRoles = async (token: string): Promise<Role[]> => {
  const res = await fetch(`${API_BASE}/api/admin/roles`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Không thể lấy danh sách roles");
  }

  return res.json();
};

export const useRoles = () => {
  const { token } = useAuth();

  return useQuery<Role[]>({
    queryKey: ["roles"],
    queryFn: () => fetchRoles(token || ""),
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
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
        const error = await res.json();
        throw new Error(error.error || "Không thể tạo role");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success("Tạo role thành công!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Có lỗi xảy ra");
    },
  });
};

export const useUpdateRole = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: {
      id: number;
      name?: string;
      description?: string;
      permission_ids?: number[];
    }) => {
      const res = await fetch(`${API_BASE}/api/admin/roles/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Không thể cập nhật role");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
      toast.success("Cập nhật role thành công!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Có lỗi xảy ra");
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
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Không thể xóa role");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success("Xóa role thành công!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Có lỗi xảy ra");
    },
  });
};

