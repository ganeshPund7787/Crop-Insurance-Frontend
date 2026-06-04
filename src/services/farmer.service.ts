import api from "../lib/axios";
import type {
  FarmerProfileResponse,
  Farm,
  AddFarmPayload,
  CropsListResponse,
  AddCropPayload,
  FarmerClaimsListResponse,
  FarmerClaimDetailResponse,
  SubmitClaimPayload,
} from "../types/farmer.types";

export const farmerService = {
  // ── Profile ────────────────────────────────────────────
  getProfile: async (): Promise<FarmerProfileResponse> => {
    const { data } = await api.get<FarmerProfileResponse>(
      "/api/farmer/profile",
    );
    return data;
  },

  // ── Farms ──────────────────────────────────────────────
  addFarm: async (payload: AddFarmPayload): Promise<Farm> => {
    const { data } = await api.post<{ success: boolean; data: Farm }>(
      "/api/farmer/farms",
      payload,
    );
    return data.data;
  },

  // ── Crops ──────────────────────────────────────────────
  getCrops: async (farmId: string): Promise<CropsListResponse> => {
    const { data } = await api.get<CropsListResponse>(
      `/api/farmer/farms/${farmId}/crops`,
    );
    return data;
  },

  addCrop: async (farmId: string, payload: AddCropPayload): Promise<void> => {
    await api.post(`/api/farmer/farms/${farmId}/crops`, payload);
  },

  // ── Claims ─────────────────────────────────────────────
  getClaims: async (): Promise<FarmerClaimsListResponse> => {
    const { data } =
      await api.get<FarmerClaimsListResponse>("/api/farmer/claims");
    return data;
  },

  getClaimStatus: async (
    claimId: string,
  ): Promise<FarmerClaimDetailResponse> => {
    const { data } = await api.get<FarmerClaimDetailResponse>(
      `/api/farmer/claims/${claimId}/status`,
    );
    return data;
  },

  submitClaim: async (
    payload: SubmitClaimPayload,
  ): Promise<FarmerClaimDetailResponse> => {
    const { data } = await api.post<FarmerClaimDetailResponse>(
      "/api/farmer/claims",
      payload,
    );
    return data;
  },
};
