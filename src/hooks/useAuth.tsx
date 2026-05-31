import { useSelector, useDispatch } from "react-redux";
import { useQuery, useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import type { RootState, AppDispatch } from "../store";
import {
  logout,
  setCredentials,
  updateAccessToken,
  setLoading,
} from "../store/slices/authSlice";
import type { ChangePasswordPayload, User } from "../types/auth.types";
import { ROLES } from "../config/constants";
import { farmerService } from "../services/farmer.service";
import { authService } from "../services/auth.service";
import { getErrorMessage } from "../lib/utils";
import { queryClient } from "../lib/queryClient";

// ── Core auth hook ─────────────────────────────────────────
export function useAuth() {
  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector((state: RootState) => state.auth);

  const isFarmer = auth.user?.role === ROLES.FARMER;
  const isAdmin = auth.user?.role === ROLES.ADMIN;

  return {
    user: auth.user,
    accessToken: auth.accessToken,
    refreshToken: auth.refreshToken,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    role: auth.user?.role ?? null,
    isFarmer,
    isAdmin,

    setCredentials: (payload: {
      user: User;
      accessToken: string;
      refreshToken?: string;
    }) => dispatch(setCredentials(payload)),

    updateAccessToken: (token: string) => dispatch(updateAccessToken(token)),

    setLoading: (val: boolean) => dispatch(setLoading(val)),

    logout: () => dispatch(logout()),
  };
}

// ── Query: Farmer profile ──────────────────────────────────
export function useFarmerProfile() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["farmer", "profile"],
    queryFn: farmerService.getProfile,
    enabled: isAuthenticated,
    select: (res) => res.data, // unwrap → gives FarmerProfile directly
  });
}

// ── Mutation: Login ────────────────────────────────────────
export function useLoginMutation() {
  const dispatch = useDispatch<AppDispatch>();

  return useMutation({
    mutationFn: authService.login,
    onSuccess: (response) => {
      // Map API response → our User shape
      const user: User = {
        userId: response.data.userId,
        fullName: response.data.fullName,
        email: response.data.email,
        role: response.data.role,
      };

      // accessToken comes from cookie — but save what we have
      dispatch(
        setCredentials({
          user,
          accessToken: response.data.userId, // cookie-based: store userId as ref
          refreshToken: undefined,
        }),
      );

      toast.success(`Welcome back, ${user.fullName}! 🌾`);
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error));
    },
  });
}

// ── Mutation: Register ─────────────────────────────────────
export function useRegisterMutation() {
  const dispatch = useDispatch<AppDispatch>();

  return useMutation({
    mutationFn: authService.register,
    onSuccess: (response) => {
      const user: User = {
        userId: response.data.userId,
        fullName: response.data.fullName,
        email: response.data.email,
        role: response.data.role,
      };

      dispatch(
        setCredentials({
          user,
          accessToken: response.data.userId,
          refreshToken: undefined,
        }),
      );

      toast.success(`Welcome to CropShield, ${user.fullName}! 🌱`);
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error));
    },
  });
}

// ── Mutation: Change password ──────────────────────────────
export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) =>
      authService.changePassword(payload),
    onSuccess: () => {
      toast.success("Password changed successfully!");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error));
    },
  });
}

// ── Mutation: Add farm ─────────────────────────────────────
export function useAddFarmMutation() {
  return useMutation({
    mutationFn: farmerService.addFarm,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farmer", "profile"] });
      toast.success("Farm added successfully! 🌾");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error));
    },
  });
}
