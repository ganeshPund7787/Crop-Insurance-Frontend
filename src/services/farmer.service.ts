import api from "../lib/axios";
import type {
  FarmerProfileResponse,
  Farm,
  AddFarmPayload,
} from "../types/farmer.types";

export const farmerService = {
  getProfile: async (): Promise<FarmerProfileResponse> => {
    const { data } = await api.get<FarmerProfileResponse>(
      "/api/farmer/profile",
    );
    return data;
  },

  addFarm: async (payload: AddFarmPayload): Promise<Farm> => {
    const { data } = await api.post<{ success: boolean; data: Farm }>(
      "/api/farmer/farms",
      payload,
    );
    return data.data;
  },
};
