import { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Plus,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  RefreshCw,
  IndianRupee,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardContent} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { farmerService } from "../../services/farmer.service";
import { formatINR } from "../../lib/utils";
import { ROUTES } from "../../config/constants";
import Loader from "../../components/common/Loader";
import dayjs from "dayjs";
import type { FarmerClaim, FarmerClaimStatus } from "../../types/farmer.types";

// ── Status config ──────────────────────────────────────────
function ClaimStatusBadge({ status }: { status: FarmerClaimStatus | string }) {
  const config: Record<
    string,
    { label: string; className: string; icon: React.ElementType }
  > = {
    submitted: {
      label: "Submitted",
      icon: Clock,
      className: "bg-yellow-500/10  text-yellow-600  dark:text-yellow-400",
    },
    underreview: {
      label: "Under Review",
      icon: AlertCircle,
      className: "bg-purple-500/10  text-purple-600  dark:text-purple-400",
    },
    assigned: {
      label: "Assigned",
      icon: Clock,
      className: "bg-blue-500/10    text-blue-600    dark:text-blue-400",
    },
    underinspection: {
      label: "Under Inspection",
      icon: AlertCircle,
      className: "bg-orange-500/10  text-orange-600  dark:text-orange-400",
    },
    approved: {
      label: "Approved",
      icon: CheckCircle,
      className: "bg-primary-500/10 text-primary-600 dark:text-primary-400",
    },
    rejected: {
      label: "Rejected",
      icon: XCircle,
      className: "bg-red-500/10     text-red-600     dark:text-red-400",
    },
    closed: {
      label: "Closed",
      icon: CheckCircle,
      className: "bg-muted          text-muted-foreground",
    },
  };
  const key = status?.toLowerCase().trim();
  const c = config[key] ?? {
    label: status,
    icon: Clock,
    className: "bg-muted text-muted-foreground",
  };

  return (
    <Badge
      variant="secondary"
      className={`text-xs font-medium gap-1 ${c.className}`}
    >
      <c.icon className="w-3 h-3" />
      {c.label}
    </Badge>
  );
}

// ── Claim progress steps ───────────────────────────────────
const CLAIM_STEPS: { key: string; label: string }[] = [
  { key: "submitted", label: "Submitted" },
  { key: "underreview", label: "Under Review" },
  { key: "assigned", label: "Assigned" },
  { key: "underinspection", label: "Inspection" },
  { key: "approved", label: "Approved" },
];

function ClaimProgressBar({ status }: { status: string }) {
  const key = status?.toLowerCase().trim();
  const currentIndex = CLAIM_STEPS.findIndex((s) => s.key === key);
  const isRejected = key === "rejected";

  if (isRejected) {
    return (
      <div className="flex items-center gap-2 mt-3">
        <div className="flex-1 h-1.5 rounded-full bg-red-500/20">
          <div className="h-full w-full rounded-full bg-red-500" />
        </div>
        <span className="text-xs text-red-500 font-medium shrink-0">
          Rejected
        </span>
      </div>
    );
  }

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-1.5">
        {CLAIM_STEPS.map((step, i) => (
          <div
            key={step.key}
            className="flex flex-col items-center gap-1 flex-1"
          >
            <div
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                i <= currentIndex ? "bg-primary-500" : "bg-muted-foreground/25"
              }`}
            />
          </div>
        ))}
      </div>
      <div className="relative h-1 bg-muted rounded-full">
        <div
          className="absolute h-full bg-primary-500 rounded-full transition-all duration-500"
          style={{
            width:
              currentIndex < 0
                ? "0%"
                : `${(currentIndex / (CLAIM_STEPS.length - 1)) * 100}%`,
          }}
        />
      </div>
      <div className="flex justify-between mt-1">
        {CLAIM_STEPS.map((step, i) => (
          <span
            key={step.key}
            className={`text-[10px] text-center flex-1 leading-tight ${
              i === currentIndex
                ? "text-primary-600 dark:text-primary-400 font-semibold"
                : i < currentIndex
                  ? "text-muted-foreground"
                  : "text-muted-foreground/50"
            }`}
          >
            {step.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Claim card ─────────────────────────────────────────────
function ClaimCard({ claim, index }: { claim: FarmerClaim; index: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
    >
      <Card className="border-border hover:shadow-card transition-all">
        <CardContent className="p-4">
          {/* Header row */}
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-primary-500" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-foreground text-sm">
                  {claim.claimNumber}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {claim.reviewedAtUtc
                    ? dayjs(claim.reviewedAtUtc).format("DD MMM YYYY")
                    : "Pending review"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <ClaimStatusBadge status={claim.status} />
              <button
                onClick={() => setExpanded((p) => !p)}
                className="p-1 rounded-lg hover:bg-accent transition-colors"
              >
                {expanded ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>

          {/* Amounts row */}
          <div className="flex items-center gap-4 mt-3 flex-wrap">
            <div>
              <p className="text-xs text-muted-foreground">Estimated Loss</p>
              <p className="text-sm font-bold text-foreground">
                {formatINR(claim.estimatedLossAmount)}
              </p>
            </div>
            {claim.approvedAmount != null && (
              <>
                <div className="w-px h-8 bg-border" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    Approved Amount
                  </p>
                  <p className="text-sm font-bold text-primary-600 dark:text-primary-400">
                    {formatINR(claim.approvedAmount)}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Progress bar */}
          <ClaimProgressBar status={claim.status} />

          {/* Expandable details */}
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-4 pt-4 border-t border-border space-y-3"
            >
              {/* Status description */}
              <div className="p-3 rounded-xl bg-muted/40 border border-border">
                <p className="text-xs font-semibold text-muted-foreground mb-1">
                  Current Status
                </p>
                <p className="text-sm text-foreground">
                  {claim.statusDescription}
                </p>
              </div>

              {/* Next step */}
              {claim.nextStep && (
                <div className="p-3 rounded-xl bg-primary-500/5 border border-primary-500/20">
                  <p className="text-xs font-semibold text-primary-600 dark:text-primary-400 mb-1">
                    Next Step
                  </p>
                  <p className="text-sm text-foreground">{claim.nextStep}</p>
                </div>
              )}

              {/* Rejection reason */}
              {claim.rejectionReason && (
                <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/20">
                  <p className="text-xs font-semibold text-red-600 mb-1">
                    Rejection Reason
                  </p>
                  <p className="text-sm text-foreground">
                    {claim.rejectionReason}
                  </p>
                </div>
              )}

              {/* Inspection badge */}
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className={`text-xs ${
                    claim.hasInspection
                      ? "bg-primary-500/10 text-primary-600 dark:text-primary-400"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {claim.hasInspection
                    ? "✅ Inspection Scheduled"
                    : "⏳ No Inspection Yet"}
                </Badge>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Main component ─────────────────────────────────────────
export default function FarmerClaims() {
  const navigate = useNavigate();

  const {
    data: claimsRes,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ["farmer", "claims"],
    queryFn: farmerService.getClaims,
    select: (r) => r.data,
  });

  const claims = claimsRes ?? [];

  // ── Counts ─────────────────────────────────────────────
  const approvedCount = claims.filter(
    (c: any) => c.status?.toLowerCase() === "approved",
  ).length;
  const pendingCount = claims.filter(
    (c: any) =>
      !["approved", "rejected", "closed"].includes(c.status?.toLowerCase()),
  ).length;
  const rejectedCount = claims.filter(
    (c: any) => c.status?.toLowerCase() === "rejected",
  ).length;

  const totalApproved = claims
    .filter((c: any) => c.status?.toLowerCase() === "approved")
    .reduce((acc: any, c: any) => acc + (c.approvedAmount ?? 0), 0);

  if (isLoading) return <Loader />;

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-3"
      >
        <div>
          <h1 className="font-display text-xl font-bold text-foreground">
            My Claims
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Track all your insurance claims
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="gap-2"
          >
            <RefreshCw
              className={`w-4 h-4 ${isRefetching ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button
            size="sm"
            className="bg-primary-600 hover:bg-primary-700 text-white gap-2"
            onClick={() => navigate(ROUTES.FARMER_NEW_CLAIM)}
          >
            <Plus className="w-4 h-4" />
            New Claim
          </Button>
        </div>
      </motion.div>

      {/* ── Summary cards ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
      >
        {[
          {
            label: "Total Claims",
            value: claims.length,
            icon: FileText,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
          },
          {
            label: "In Progress",
            value: pendingCount,
            icon: Clock,
            color: "text-yellow-500",
            bg: "bg-yellow-500/10",
          },
          {
            label: "Approved",
            value: approvedCount,
            icon: CheckCircle,
            color: "text-primary-500",
            bg: "bg-primary-500/10",
          },
          {
            label: "Rejected",
            value: rejectedCount,
            icon: XCircle,
            color: "text-red-500",
            bg: "bg-red-500/10",
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 + i * 0.06 }}
          >
            <Card className="border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      {stat.label}
                    </p>
                    <p className="font-display text-2xl font-bold text-foreground">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`${stat.bg} p-2.5 rounded-xl`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Total approved amount ── */}
      {totalApproved > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-primary-500/20 bg-primary-500/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-500/15 flex items-center justify-center">
                  <IndianRupee className="w-5 h-5 text-primary-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Total Approved Amount
                  </p>
                  <p className="font-display text-xl font-bold text-primary-600 dark:text-primary-400">
                    {formatINR(totalApproved)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ── Claims list ── */}
      {claims.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="border-border">
            <CardContent className="py-16 text-center">
              <div className="text-5xl mb-3">📋</div>
              <p className="text-foreground font-semibold mb-1">
                No claims yet
              </p>
              <p className="text-muted-foreground text-sm mb-5">
                If your crop has been damaged, submit a claim to get insurance
                coverage
              </p>
              <Button
                className="bg-primary-600 hover:bg-primary-700 text-white gap-2"
                onClick={() => navigate(ROUTES.FARMER_NEW_CLAIM)}
              >
                <Plus className="w-4 h-4" />
                Submit Your First Claim
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {claims.map((claim: any, i: any) => (
            <ClaimCard key={claim.id} claim={claim} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
