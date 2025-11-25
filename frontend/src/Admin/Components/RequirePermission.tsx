import { ReactNode } from "react";
import { useHasPermission } from "../hook/usePermissions";

interface RequirePermissionProps {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Component wrapper để chỉ hiển thị children nếu user có permission
 */
export const RequirePermission = ({
  permission,
  children,
  fallback = null,
}: RequirePermissionProps) => {
  const hasPermission = useHasPermission(permission);

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

