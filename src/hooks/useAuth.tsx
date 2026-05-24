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
import type { User } from "../types/auth.types";
import { ROLES } from "../config/constants";
import { farmerService } from "../services/farmer.service";
import { authService } from "../services/auth.service";
import { getErrorMessage } from "../lib/utils";
import { queryClient } from "../lib/queryClient";

// ── Core auth hook ─────────────────────────────────────────
export function useAuth() {
  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector((state: RootState) => state.auth);
  console.log("useAuth : ", auth.user);
  const isFarmer = auth.user?.role === ROLES.FARMER;
  const isAdmin = auth.user?.role === ROLES.ADMIN;
  const isInsuranceAgent = auth.user?.role === ROLES.INSURANCE_AGENT;

  return {
    user: auth.user,
    accessToken: auth.accessToken,
    refreshToken: auth.refreshToken,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    role: auth.user?.role ?? null,
    isFarmer,
    isAdmin,
    isInsuranceAgent,

    setCredentials: (payload: {
      user: User;
      accessToken: string;
      refreshToken: string;
    }) => dispatch(setCredentials(payload)),

    updateAccessToken: (token: string) => dispatch(updateAccessToken(token)),

    setLoading: (val: boolean) => dispatch(setLoading(val)),

    logout: () => dispatch(logout()),
  };
}

// ── Query: Farmer profile ──────────────────────────────────
export function useFarmerProfile() {
  return useQuery({
    queryKey: ["farmer", "profile"],
    queryFn: farmerService.getProfile,
  });
}

export function useLoginMutation() {
  const { setCredentials } = useAuth();

  return useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      setCredentials({
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
      toast.success(`Welcome back, ${data.user.fullName}! 🌾`);
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useRegisterMutation() {
  const { setCredentials } = useAuth();

  return useMutation({
    mutationFn: (payload: import("../types/auth.types").RegisterPayload) =>
      authService.register(payload),
    onSuccess: (data) => {
      setCredentials({
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
      toast.success(`Welcome to CropShield, ${data.user.fullName}! 🌱`);
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error));
    },
  });
}
// ── Mutation: Change password ──────────────────────────────
export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: authService.changePassword,
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
