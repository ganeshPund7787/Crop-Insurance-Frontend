import api from "../lib/axios";
import type {
  FarmersListResponse,
  AgentsListResponse,
} from "../types/admin.types";

export const adminService = {
  getAllFarmers: async (): Promise<FarmersListResponse> => {
    const { data } = await api.get<FarmersListResponse>(
      "/api/admin/users/farmers",
    );
    return data;
  },
  getAllAgents: async (): Promise<AgentsListResponse> => {
    const { data } = await api.get<AgentsListResponse>("/api/admin/agents");
    return data;
  },
};
