// ── Request Types ──────────────────────────────────────────────────────────

export interface ClaimRiskAnalysisRequest {
  cropName: string;
  season: string;
  damageType: string;
  damageDescription: string;
  estimatedLossAmount: number;
  farmLocation: string;
  soilType: string;
  farmAreaInAcres: number;
  incidentDate: string;
  sowingDate: string;
  expectedHarvestDate: string;
}

export interface CropAdvisoryRequest {
  question: string;
  cropName?: string;
  season?: string;
  district?: string;
  soilType?: string;
}

export interface DamageReportRequest {
  rawFindings: string;
  cropName: string;
  damageType: string;
  damagePercentage: number;
  recommendedAmount: number;
  farmLocation: string;
  inspectionNumber: string;
  inspectionDate: string;
  agentName?: string;
}

// ── Response Types ─────────────────────────────────────────────────────────

export interface ClaimRiskAnalysisResponse {
  riskScore: number;
  riskLevel: "Low" | "Medium" | "High" | "Critical";
  recommendation: "Approve" | "Reject" | "Investigate";
  reasoningSummary: string;
  redFlags: string[];
  positiveIndicators: string[];
  rawAiResponse: string;
}

export interface CropAdvisoryResponse {
  answer: string;
  keyPoints: string[];
  precautions: string[];
  disclaimer: string;
  rawAiResponse: string;
}

export interface DamageReportResponse {
  executiveSummary: string;
  damageAssessment: string;
  financialImpact: string;
  inspectorConclusion: string;
  keyObservations: string[];
  recommendedAction: string;
  rawAiResponse: string;
}

// ── API Wrapper ────────────────────────────────────────────────────────────

export interface AiApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}
