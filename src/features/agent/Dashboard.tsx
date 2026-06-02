import { motion } from "framer-motion";
import {
  FileText,
  ClipboardCheck,
  TrendingUp,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { agentService } from "../../services/agent.service";
import { useAuth } from "../../hooks/useAuth";
import { ROUTES } from "../../config/constants";
import { getInitials, formatINR } from "../../lib/utils";
import Loader from "../../components/common/Loader";
import dayjs from "dayjs";

// ── Animation variants ─────────────────────────────────────
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4 },
  }),
};

// ── Status badge ───────────────────────────────────────────
export function ClaimStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    submitted: {
      label: "Submitted",
      className: "bg-yellow-500/10  text-yellow-600  dark:text-yellow-400",
    },
    underreview: {
      label: "Under Review",
      className: "bg-purple-500/10  text-purple-600  dark:text-purple-400",
    },
    assigned: {
      label: "Assigned",
      className: "bg-blue-500/10    text-blue-600    dark:text-blue-400",
    },
    underinspection: {
      label: "Under Inspection",
      className: "bg-orange-500/10  text-orange-600  dark:text-orange-400",
    },
    approved: {
      label: "Approved",
      className: "bg-primary-500/10 text-primary-600 dark:text-primary-400",
    },
    rejected: {
      label: "Rejected",
      className: "bg-red-500/10     text-red-600     dark:text-red-400",
    },
    closed: { label: "Closed", className: "bg-muted text-muted-foreground" },
  };

  const key = status?.toLowerCase().trim();
  const c = config[key] ?? {
    label: status,
    className: "bg-muted text-muted-foreground",
  };

  return (
    <Badge variant="secondary" className={`text-xs font-medium ${c.className}`}>
      {c.label}
    </Badge>
  );
}

export default function AgentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: profileRes, isLoading: profileLoading } = useQuery({
    queryKey: ["agent", "profile"],
    queryFn: agentService.getProfile,
    select: (r) => r.data,
  });

  const { data: claimsRes, isLoading: claimsLoading } = useQuery({
    queryKey: ["agent", "claims"],
    queryFn: agentService.getClaims,
    select: (r) => r.data,
  });

  const { data: inspectionsRes } = useQuery({
    queryKey: ["agent", "inspections"],
    queryFn: agentService.getInspections,
    select: (r) => r.data,
  });

  const claims = claimsRes ?? [];
  const inspections = inspectionsRes ?? [];

  // ── Derived stats ──────────────────────────────────────
  const submittedClaims = claims.filter(
    (c) => c.status?.toLowerCase() === "submitted",
  ).length;
  const assignedClaims = claims.filter(
    (c) => c.status?.toLowerCase() === "assigned",
  ).length;
  const underInspection = claims.filter(
    (c) => c.status?.toLowerCase() === "underinspection",
  ).length;
  const approvedClaims = claims.filter(
    (c) => c.status?.toLowerCase() === "approved",
  ).length;
  const scheduledInspections = inspections.filter(
    (i) => i.status === "Scheduled",
  ).length;

  const recentClaims = [...claims]
    .sort(
      (a, b) =>
        new Date(b.createdAtUtc).getTime() - new Date(a.createdAtUtc).getTime(),
    )
    .slice(0, 5);

  const stats = [
    {
      label: "Submitted Claims",
      value: submittedClaims,
      icon: Clock,
      color: "text-yellow-500",
      bg: "bg-yellow-500/10",
      change: "Awaiting assignment",
    },
    {
      label: "My Assigned",
      value: assignedClaims,
      icon: FileText,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      change: "In progress",
    },
    {
      label: "Under Inspection",
      value: underInspection,
      icon: ClipboardCheck,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
      change: `${scheduledInspections} scheduled`,
    },
    {
      label: "Approved",
      value: approvedClaims,
      icon: CheckCircle,
      color: "text-primary-500",
      bg: "bg-primary-500/10",
      change: "This cycle",
    },
  ];

  if (profileLoading || claimsLoading) return <Loader />;

  return (
    <div className="space-y-6">
      {/* ── Welcome banner ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-green-gradient p-6 text-white relative overflow-hidden"
      >
        <div className="absolute right-0 top-0 w-48 h-48 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute right-16 bottom-0 w-24 h-24 rounded-full bg-white/5 translate-y-1/2" />
        <div className="relative z-10 flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-primary-200 text-sm font-medium mb-1">
              Agent Portal 👋
            </p>
            <h2 className="font-display text-2xl font-bold mb-1">
              {user?.fullName ?? "Agent"}
            </h2>
            <p className="text-primary-200 text-sm">
              {profileRes?.assignedDistrict
                ? `Assigned District: ${profileRes.assignedDistrict}`
                : "Welcome to CropShield Agent Portal"}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            {profileRes?.agentCode && (
              <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-primary-300" />
                <span className="text-white text-xs font-medium">
                  {profileRes.agentCode}
                </span>
              </div>
            )}
            {profileRes?.isVerified && (
              <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-primary-300" />
                <span className="text-white text-xs font-medium">
                  Verified Agent
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="absolute top-4 right-6 text-5xl opacity-20">🛡️</div>
      </motion.div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
          >
            <Card className="border-border hover:shadow-card transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-muted-foreground text-xs font-medium mb-1">
                      {stat.label}
                    </p>
                    <p className="font-display text-2xl font-bold text-foreground">
                      {stat.value}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.change}
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
      </div>

      {/* ── Two column layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent claims */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="lg:col-span-2"
        >
          <Card className="border-border h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="font-display text-lg">
                Recent Claims
              </CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate(ROUTES.AGENT_CLAIMS)}
                className="gap-1.5 text-primary-600 border-primary-500/30 hover:bg-primary-500/5"
              >
                View All
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </CardHeader>
            <CardContent>
              {recentClaims.length === 0 ? (
                <div className="text-center py-10">
                  <div className="text-4xl mb-2">📋</div>
                  <p className="text-muted-foreground text-sm">
                    No claims in your district yet
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentClaims.map((claim, i) => (
                    <motion.div
                      key={claim.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.06 }}
                      onClick={() => navigate(`/agent/claims/${claim.id}`)}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent/50 transition-colors cursor-pointer group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-primary-500/10 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4 text-primary-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-foreground">
                            {claim.claimNumber}
                          </p>
                          <ClaimStatusBadge status={claim.status} />
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {claim.farmerName} · {claim.cropName}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-foreground">
                          {formatINR(claim.estimatedLossAmount)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {dayjs(claim.createdAtUtc).format("DD MMM")}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Right column */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-5"
        >
          {/* Agent profile card */}
          <Card className="border-border">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="w-12 h-12 ring-2 ring-primary-500/30">
                  <AvatarFallback className="bg-primary-700 text-white font-bold text-sm">
                    {getInitials(user?.fullName ?? "A")}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground text-sm truncate">
                    {user?.fullName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {profileRes?.agentCode ?? "Agent"}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { label: "License", value: profileRes?.licenseNumber ?? "—" },
                  {
                    label: "District",
                    value: profileRes?.assignedDistrict ?? "—",
                  },
                  {
                    label: "Claims Handled",
                    value: profileRes?.totalClaimsHandled ?? 0,
                  },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between py-1.5 border-b border-border last:border-0"
                  >
                    <span className="text-xs text-muted-foreground">
                      {row.label}
                    </span>
                    <span className="text-xs font-semibold text-foreground">
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
              <Button
                size="sm"
                variant="outline"
                className="w-full mt-4 text-primary-600 border-primary-500/30 hover:bg-primary-500/5"
                onClick={() => navigate(ROUTES.AGENT_PROFILE)}
              >
                View Full Profile
              </Button>
            </CardContent>
          </Card>

          {/* Quick actions */}
          <Card className="border-border">
            <CardHeader className="pb-3 pt-4 px-5">
              <CardTitle className="text-sm font-semibold">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="space-y-2">
                {[
                  {
                    label: "View All Claims",
                    icon: "📋",
                    to: ROUTES.AGENT_CLAIMS,
                  },
                  {
                    label: "My Inspections",
                    icon: "🔍",
                    to: ROUTES.AGENT_INSPECTIONS,
                  },
                  {
                    label: "District Farmers",
                    icon: "👨‍🌾",
                    to: ROUTES.AGENT_FARMERS,
                  },
                ].map((action) => (
                  <button
                    key={action.label}
                    onClick={() => navigate(action.to)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-border hover:border-primary-500/30 hover:bg-primary-500/5 transition-all group text-left"
                  >
                    <span className="text-lg group-hover:scale-110 transition-transform">
                      {action.icon}
                    </span>
                    <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground">
                      {action.label}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 ml-auto text-muted-foreground group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ── Upcoming inspections ── */}
      {inspections.filter((i) => i.status === "Scheduled").length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                Upcoming Inspections
              </CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate(ROUTES.AGENT_INSPECTIONS)}
                className="gap-1.5 text-primary-600 border-primary-500/30"
              >
                View All
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {inspections
                  .filter((i) => i.status === "Scheduled")
                  .slice(0, 3)
                  .map((inspection, i) => (
                    <motion.div
                      key={inspection.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.06 }}
                      className="flex items-center gap-3 p-3 rounded-xl border border-orange-500/20 bg-orange-500/5"
                    >
                      <div className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
                        <ClipboardCheck className="w-4 h-4 text-orange-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">
                          {inspection.claimNumber}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {inspection.farmerName}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-semibold text-orange-600 dark:text-orange-400">
                          {dayjs(inspection.scheduledDate).format(
                            "DD MMM YYYY",
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {dayjs(inspection.scheduledDate).format("hh:mm A")}
                        </p>
                      </div>
                    </motion.div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
