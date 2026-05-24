import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { ROLES, ROUTES } from "../../config/constants";

interface RoleGuardProps {
  allowedRole: number;
}

export default function RoleGuard({ allowedRole }: RoleGuardProps) {
  const { role } = useAuth();
  console.log(
    "RoleGuard → role:",
    role,
    typeof role,
    "| allowedRole:",
    allowedRole,
    typeof allowedRole,
  );

  // No role in store yet
  if (role === null || role === undefined) {
    return <Navigate to="/login" replace />;
  }

  // Exact match — let through
  if (role === allowedRole) {
    return <Outlet />;
  }

  // Wrong role — send to their correct home
  switch (role) {
    case ROLES.ADMIN:
      return <Navigate to={ROUTES.ADMIN_DASHBOARD} replace />;
    case ROLES.FARMER:
      return <Navigate to={ROUTES.FARMER_DASHBOARD} replace />;
    default:
      return <Navigate to="/login" replace />;
  }
}
