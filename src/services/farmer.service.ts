import api from "../lib/axios";
import type {
  FarmerProfile,
  Farm,
  AddFarmPayload,
} from "../types/farmer.types";

export const farmerService = {
  // ── Get profile ────────────────────────────────────────
  getProfile: async (): Promise<FarmerProfile> => {
    const { data } = await api.get<FarmerProfile>("/api/farmer/profile");
    return data;
  },

  // ── Add farm ───────────────────────────────────────────
  addFarm: async (payload: AddFarmPayload): Promise<Farm> => {
    const { data } = await api.post<Farm>("/api/farmer/farms", payload);
    return data;
  },
};
