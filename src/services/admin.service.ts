import api from "../lib/axios";
import type { FarmerListItem } from "../types/admin.types";

export const adminService = {
  // ── Get all farmers ────────────────────────────────────
  getAllFarmers: async (): Promise<FarmerListItem[]> => {
    const { data } = await api.get<FarmerListItem[]>(
      "/api/admin/users/farmers",
    );
    return data;
  },
};
