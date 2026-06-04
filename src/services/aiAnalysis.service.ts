import api from "../lib/axios";
import type {
  AiApiResponse,
  ClaimRiskAnalysisRequest,
  ClaimRiskAnalysisResponse,
  CropAdvisoryRequest,
  CropAdvisoryResponse,
  DamageReportRequest,
  DamageReportResponse,
} from "../types/aiAnalysis.types";

export const aiAnalysisService = {
  analyzeClaimRisk: async (
    payload: ClaimRiskAnalysisRequest,
  ): Promise<AiApiResponse<ClaimRiskAnalysisResponse>> => {
    const { data } = await api.post<AiApiResponse<ClaimRiskAnalysisResponse>>(
      "/api/ai/claim-risk",
      payload,
    );
    return data;
  },

  getCropAdvisory: async (
    payload: CropAdvisoryRequest,
  ): Promise<AiApiResponse<CropAdvisoryResponse>> => {
    const { data } = await api.post<AiApiResponse<CropAdvisoryResponse>>(
      "/api/ai/crop-advisory",
      payload,
    );
    return data;
  },

  summarizeDamageReport: async (
    payload: DamageReportRequest,
  ): Promise<AiApiResponse<DamageReportResponse>> => {
    const { data } = await api.post<AiApiResponse<DamageReportResponse>>(
      "/api/ai/damage-summary",
      payload,
    );
    return data;
  },
};
