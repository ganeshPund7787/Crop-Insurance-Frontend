import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { ROLES } from "../../config/constants";

interface RoleGuardProps {
  allowedRole: string;
}

export default function RoleGuard({ allowedRole }: RoleGuardProps) {
  const { role, isAuthenticated, isLoading } = useAuth();

  // Still hydrating — wait
  if (isLoading) return null;

  // Not authenticated — AuthGuard handles this
  if (!isAuthenticated) return <Outlet />;

  // Admin bypass
  if (role === ROLES.ADMIN) return <Outlet />;

  // Role matches
  if (role === allowedRole) return <Outlet />;

  // Farmer hitting admin route
  if (role === ROLES.FARMER) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Navigate to="/login" replace />;
}
