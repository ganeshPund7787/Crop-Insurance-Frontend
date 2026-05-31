import api from "../lib/axios";
import type {
  AgentProfileResponse,
  ClaimsListResponse,
  ClaimDetailResponse,
  InspectionsListResponse,
  AgentFarmersResponse,
  ScheduleInspectionPayload,
  InspectionFindingsPayload,
  ApproveClaimPayload,
} from "../types/agent.types";

export const agentService = {
  // ── Profile ────────────────────────────────────────────
  getProfile: async (): Promise<AgentProfileResponse> => {
    const { data } = await api.get<AgentProfileResponse>("/api/agent/profile");
    return data;
  },

  updateProfile: async (
    payload: Partial<{ fullName: string; licenseNumber: string }>,
  ): Promise<AgentProfileResponse> => {
    const { data } = await api.put<AgentProfileResponse>(
      "/api/agent/profile",
      payload,
    );
    return data;
  },

  // ── Claims ─────────────────────────────────────────────
  getClaims: async (): Promise<ClaimsListResponse> => {
    const { data } = await api.get<ClaimsListResponse>("/api/agent/claims");
    return data;
  },

  getClaimById: async (id: string): Promise<ClaimDetailResponse> => {
    const { data } = await api.get<ClaimDetailResponse>(
      `/api/agent/claims/${id}`,
    );
    return data;
  },

  assignClaim: async (id: string): Promise<void> => {
    await api.put(`/api/agent/claims/${id}/assign`);
  },

  scheduleInspection: async (
    claimId: string,
    payload: ScheduleInspectionPayload,
  ): Promise<void> => {
    await api.post(`/api/agent/claims/${claimId}/inspection`, payload);
  },

  approveClaim: async (
    claimId: string,
    payload: ApproveClaimPayload,
  ): Promise<void> => {
    await api.put(`/api/agent/claims/${claimId}/approve`, payload);
  },

  // ── Inspections ────────────────────────────────────────
  getInspections: async (): Promise<InspectionsListResponse> => {
    const { data } = await api.get<InspectionsListResponse>(
      "/api/agent/inspections",
    );
    return data;
  },

  updateInspectionFindings: async (
    inspectionId: string,
    payload: InspectionFindingsPayload,
  ): Promise<void> => {
    await api.put(`/api/agent/inspections/${inspectionId}`, payload);
  },

  // ── Farmers ────────────────────────────────────────────
  getFarmers: async (): Promise<AgentFarmersResponse> => {
    const { data } = await api.get<AgentFarmersResponse>("/api/agent/farmers");
    return data;
  },
};
