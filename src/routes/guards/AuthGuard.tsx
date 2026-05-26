import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";

export default function AuthGuard() {
  const { isAuthenticated, user } = useSelector((s: RootState) => s.auth);
  const location = useLocation();

  // Has user object in Redux/localStorage = authenticated
  const hasAuth = isAuthenticated && !!user;

  if (!hasAuth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
