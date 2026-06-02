// // ── Agent Profile ──────────────────────────────────────────
// export interface AgentProfile {
//   id: string;
//   fullName: string;
//   email: string;
//   agentCode: string;
//   licenseNumber: string;
//   assignedDistrict: string;
//   isVerified: boolean;
//   totalClaimsHandled: number;
// }

// export interface AgentProfileResponse {
//   success: boolean;
//   message: string;
//   data: AgentProfile;
//   errors: string[];
// }

// // ── Claims ─────────────────────────────────────────────────
// export type ClaimStatus =
//   | "Submitted" // ← was 'Pending'
//   | "UnderReview" // ← possibly exists
//   | "Assigned"
//   | "UnderInspection"
//   | "Approved"
//   | "Rejected"
//   | "Closed";
// export interface Claim {
//   id: string;
//   claimNumber: string;
//   farmerName: string;
//   farmName: string;
//   cropType: string;
//   district: string;
//   status: ClaimStatus;
//   claimAmount: number;
//   incidentDate: string;
//   createdAt: string;
//   assignedAgentId?: string;
// }

// export interface ClaimDetail extends Claim {
//   farmerEmail: string;
//   farmerPhone: string;
//   farmLocation: string;
//   farmArea: number;
//   description: string;
//   inspectionDate?: string;
//   findings?: string;
//   approvedAmount?: number;
// }

// export interface ClaimsListResponse {
//   success: boolean;
//   message: string;
//   data: Claim[];
//   errors: string[];
// }

// export interface ClaimDetailResponse {
//   success: boolean;
//   message: string;
//   data: ClaimDetail;
//   errors: string[];
// }

// // ── Inspections ────────────────────────────────────────────
// export interface Inspection {
//   id: string;
//   claimId: string;
//   claimNumber: string;
//   farmerName: string;
//   scheduledDate: string;
//   status: "Scheduled" | "Completed" | "Cancelled";
//   findings?: string;
//   district: string;
// }

// export interface InspectionsListResponse {
//   success: boolean;
//   message: string;
//   data: Inspection[];
//   errors: string[];
// }

// // ── Agent Farmers ──────────────────────────────────────────
// export interface AgentFarmer {
//   userId: string;
//   fullName: string;
//   email: string;
//   phoneNumber?: string;
//   state?: string;
//   district?: string;
//   farmsCount?: number;
//   createdAt?: string;
// }

// export interface AgentFarmersResponse {
//   success: boolean;
//   message: string;
//   data: AgentFarmer[];
//   errors: string[];
// }

// // ── Payloads ───────────────────────────────────────────────
// export interface ScheduleInspectionPayload {
//   scheduledDate: string;
//   notes?: string;
// }

// export interface InspectionFindingsPayload {
//   findings: string;
//   recommendation: "Approve" | "Reject" | "Reinspect";
// }

// export interface ApproveClaimPayload {
//   approvedAmount: number;
//   remarks?: string;
// }

// // ── Inspection inside claim detail ─────────────────────────
// export interface ClaimInspection {
//   id: string;
//   inspectionNumber: string;
//   scheduledAtUtc: string;
//   completedAtUtc?: string;
//   status: "Scheduled" | "Completed" | "Cancelled";
//   location?: string;
//   latitude?: number;
//   longitude?: number;
//   findings?: string;
//   damagePercentage?: number;
//   recommendedAmount?: number;
//   inspectorNotes?: string;
//   claimNumber: string;
//   createdAtUtc: string;
// }

// export interface ClaimDetail {
//   id: string;
//   claimNumber: string;
//   farmerName: string;
//   farmerEmail: string;
//   farmerPhone: string;
//   district: string;
//   village?: string;
//   aadhaarNumber?: string;
//   cropName: string;
//   season?: string;
//   expectedYieldTons?: number;
//   sowingDate?: string;
//   damageType?: string;
//   damageDescription?: string;
//   estimatedLossAmount: number;
//   approvedAmount?: number;
//   incidentDate: string;
//   status: ClaimStatus;
//   rejectionReason?: string;
//   agentRemarks?: string;
//   reviewedAtUtc?: string;
//   createdAtUtc: string;
//   inspections: ClaimInspection[];
// }

// export interface ClaimDetailResponse {
//   success: boolean;
//   message: string;
//   data: ClaimDetail;
//   errors: string[];
// }

// export interface Claim {
//   id: string;
//   claimNumber: string;
//   farmerName: string;
//   cropName: string;
//   district: string;
//   status: ClaimStatus;
//   estimatedLossAmount: number;
//   incidentDate: string;
//   createdAtUtc: string;
//   assignedAgentId?: string;
//   damageType?: string;
//   season?: string;
// }

// export interface ClaimsListResponse {
//   success: boolean;
//   message: string;
//   data: Claim[];
//   errors: string[];
// }

// ── Agent Profile ──────────────────────────────────────────
export interface AgentProfile {
  id: string;
  fullName: string;
  email: string;
  agentCode: string;
  licenseNumber: string;
  assignedDistrict: string;
  isVerified: boolean;
  totalClaimsHandled: number;
}

export interface AgentProfileResponse {
  success: boolean;
  message: string;
  data: AgentProfile;
  errors: string[];
}

// ── Claim status ───────────────────────────────────────────
export type ClaimStatus =
  | "Submitted"
  | "UnderReview"
  | "Assigned"
  | "UnderInspection"
  | "Approved"
  | "Rejected"
  | "Closed";

// ── Claim list item ────────────────────────────────────────
export interface Claim {
  id: string;
  claimNumber: string;
  farmerName: string;
  cropName: string;
  district: string;
  status: ClaimStatus;
  estimatedLossAmount: number;
  incidentDate: string;
  createdAtUtc: string;
  assignedAgentId?: string;
  damageType?: string;
  season?: string;
}

export interface ClaimsListResponse {
  success: boolean;
  message: string;
  data: Claim[];
  errors: string[];
}

// ── Inspection inside claim detail ─────────────────────────
export interface ClaimInspection {
  id: string;
  inspectionNumber: string;
  scheduledAtUtc: string;
  completedAtUtc?: string;
  status: "Scheduled" | "Completed" | "Cancelled";
  location?: string;
  latitude?: number;
  longitude?: number;
  findings?: string;
  damagePercentage?: number;
  recommendedAmount?: number;
  inspectorNotes?: string;
  claimNumber: string;
  createdAtUtc: string;
}

// ── Claim detail ───────────────────────────────────────────
export interface ClaimDetail {
  id: string;
  claimNumber: string;
  farmerName: string;
  farmerEmail: string;
  farmerPhone: string;
  district: string;
  village?: string;
  aadhaarNumber?: string;
  cropName: string;
  season?: string;
  expectedYieldTons?: number;
  sowingDate?: string;
  damageType?: string;
  damageDescription?: string;
  estimatedLossAmount: number;
  approvedAmount?: number;
  incidentDate: string;
  status: ClaimStatus;
  rejectionReason?: string;
  agentRemarks?: string;
  reviewedAtUtc?: string;
  createdAtUtc: string;
  inspections: ClaimInspection[];
}

export interface ClaimDetailResponse {
  success: boolean;
  message: string;
  data: ClaimDetail;
  errors: string[];
}

// ── Inspections ────────────────────────────────────────────
export interface Inspection {
  id: string;
  claimId?: string;
  claimNumber: string;
  farmerName: string;
  scheduledDate: string;
  status: "Scheduled" | "Completed" | "Cancelled";
  findings?: string;
  district: string;
}

export interface InspectionsListResponse {
  success: boolean;
  message: string;
  data: Inspection[];
  errors: string[];
}

// ── Agent Farmers ──────────────────────────────────────────
export interface AgentFarmer {
  userId: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  state?: string;
  district?: string;
  farmsCount?: number;
  createdAt?: string;
}

export interface AgentFarmersResponse {
  success: boolean;
  message: string;
  data: AgentFarmer[];
  errors: string[];
}

// ── Payloads ───────────────────────────────────────────────
export interface ScheduleInspectionPayload {
  scheduledDate: string;
  notes?: string;
}

export interface InspectionFindingsPayload {
  findings: string;
  recommendation: "Approve" | "Reject" | "Reinspect";
}

export interface ApproveClaimPayload {
  approvedAmount: number;
  remarks?: string;
}
