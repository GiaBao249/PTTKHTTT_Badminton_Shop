import { useQuery } from "@tanstack/react-query";
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
}

interface PermissionsResponse {
  permissions: Permission[];
  roles: Role[];
  permissionCodes: string[];
  hasNoRoles: boolean;
}

const fetchPermissions = async (token: string): Promise<PermissionsResponse> => {
  const res = await fetch(`${API_BASE}/api/admin/getPermissions`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Lỗi khi lấy quyền");
  }

  return res.json();
};

export const usePermissions = () => {
  const { user, token } = useAuth();

  return useQuery({
    queryKey: ["permissions", user?.id],
    queryFn: () => {
      if (!token) {
        throw new Error("No token available");
      }
      return fetchPermissions(token);
    },
    enabled: !!user && !!token && user.role === "admin",
    staleTime: 5 * 60 * 1000, // Cache 5 phút
    retry: 1,
    refetchOnWindowFocus: false,
  });
};
