import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { usePermissions } from "./hook/usePermissions";

interface RequirePermissionProps {
  permission: string;
  redirectTo?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Component để bảo vệ content dựa trên permission
 * Nếu không có quyền, sẽ redirect hoặc hiển thị fallback
 */
const RequirePermission = ({ 
  permission, 
  redirectTo = "/admin",
  children,
  fallback 
}: RequirePermissionProps) => {
  const { user, isLoading: authLoading } = useAuth();
  
  // Chỉ gọi usePermissions khi user là admin
  const permissionsQuery = usePermissions();
  const { data: permissionsData, isLoading: permissionsLoading, error: permissionsError } = permissionsQuery;

  // Đợi auth load xong
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Đang tải...</div>
      </div>
    );
  }

  // Kiểm tra user
  if (!user || user.role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  // Đợi permissions load xong
  if (permissionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Đang kiểm tra quyền truy cập...</div>
      </div>
    );
  }

  // Nếu có lỗi khi load permissions, cho phép truy cập tạm thời (để tránh block user)
  if (permissionsError && !permissionsLoading) {
    console.warn("Could not load permissions, allowing access temporarily:", permissionsError);
    return <>{children}</>;
  }

  // Kiểm tra permissions
  const hasPermission = permissionsData?.permissionCodes?.includes(permission) ?? false;

  if (!hasPermission) {
    // Nếu có fallback, hiển thị fallback
    if (fallback) {
      return <>{fallback}</>;
    }

    // Nếu không có fallback, redirect
    return <Navigate to={redirectTo} replace />;
  }

  // Có quyền, render children
  return <>{children}</>;
};

export default RequirePermission;

