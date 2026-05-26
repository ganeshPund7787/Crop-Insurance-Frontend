import api from "../lib/axios";
import type { FarmersListResponse } from "../types/admin.types";

export const adminService = {
  getAllFarmers: async (): Promise<FarmersListResponse> => {
    const { data } = await api.get<FarmersListResponse>(
      "/api/admin/users/farmers",
    );
    return data;
  },
};
