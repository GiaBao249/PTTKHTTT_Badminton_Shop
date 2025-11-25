import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../contexts/AuthContext";

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

interface PermissionsData {
  permissions: Permission[];
  roles: Role[];
  permissionCodes: string[];
}

const API_BASE = import.meta.env.VITE_API_URL;

const fetchPermissions = async (token: string): Promise<PermissionsData> => {
  const res = await fetch(`${API_BASE}/api/admin/getPermissions`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Không thể lấy quyền");
  }

  return res.json();
};

export const usePermissions = () => {
  const { user, token } = useAuth();

  return useQuery<PermissionsData>({
    queryKey: ["permissions", user?.id],
    queryFn: () => fetchPermissions(token || ""),
    enabled: !!user && !!token && user.role === "admin",
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};

/**
 * Hook để check xem user có permission không
 */
export const useHasPermission = (permissionCode: string): boolean => {
  const { data } = usePermissions();
  
  if (!data) return false;
  
  return data.permissionCodes.includes(permissionCode);
};

