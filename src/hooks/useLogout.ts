import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { logout } from "../store/slices/authSlice";
import { authService } from "../services/auth.service";
import { queryClient } from "../lib/queryClient";
import { ROUTES } from "../config/constants";
import type { AppDispatch } from "../store";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import { useState } from "react";

export function useLogout() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const refreshToken = useSelector((s: RootState) => s.auth.refreshToken);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      // 1. Revoke token on server (best effort — don't block logout if fails)
      if (refreshToken) {
        await authService.revokeToken(refreshToken);
      }
    } catch {
      // Server revoke failed — still logout locally
    } finally {
      // 2. Clear Redux state + localStorage
      dispatch(logout());

      // 3. Clear all TanStack Query cache
      queryClient.clear();

      // 4. Toast + redirect
      toast.success("Logged out successfully 👋");
      navigate(ROUTES.LOGIN, { replace: true });

      setIsLoggingOut(false);
    }
  }

  return { handleLogout, isLoggingOut };
}
