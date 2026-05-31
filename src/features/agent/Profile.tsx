import { motion } from "framer-motion";
import React from "react";
import {
  User,
  Mail,
  ShieldCheck,
  MapPin,
  Hash,
  FileText,
  CheckCircle,
  Award,
  ClipboardCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { agentService } from "../../services/agent.service";
import { getInitials } from "../../lib/utils";
import Loader from "../../components/common/Loader";

// ── Info row ───────────────────────────────────────────────
function InfoRow({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: React.ElementType;
  label: string;
  value?: string | number | boolean | null;
  highlight?: boolean;
}) {
  const display = typeof value === "boolean" ? (value ? "Yes" : "No") : value;

  return (
    <div className="flex items-center gap-3 py-3">
      <div className="w-9 h-9 rounded-xl bg-primary-500/10 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-primary-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
          {label}
        </p>
        <p
          className={`text-sm font-semibold mt-0.5 truncate ${
            highlight
              ? "text-primary-600 dark:text-primary-400"
              : "text-foreground"
          }`}
        >
          {display ?? (
            <span className="text-muted-foreground font-normal italic">
              Not provided
            </span>
          )}
        </p>
      </div>
    </div>
  );
}

// ── Stat card ──────────────────────────────────────────────
function StatCard({
  icon: Icon,
  label,
  value,
  color,
  bg,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
  bg: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border bg-card">
      <div className={`${bg} p-2.5 rounded-xl`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <p className="font-display text-xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground text-center">{label}</p>
    </div>
  );
}

export default function AgentProfile() {

  const {
    data: profile,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["agent", "profile"],
    queryFn: agentService.getProfile,
    select: (r) => r.data,
  });

  if (isLoading) return <Loader />;

  if (isError || !profile) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="text-5xl">😕</div>
        <p className="text-muted-foreground font-medium">
          Failed to load profile
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* ── Hero card ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-border overflow-hidden">
          {/* Banner */}
          <div className="h-28 bg-green-gradient relative">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/5" />
              <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full bg-white/5" />
            </div>
            {/* Verified badge */}
            {profile.isVerified && (
              <div className="absolute top-3 right-4">
                <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified Agent
                </Badge>
              </div>
            )}
          </div>

          <CardContent className="px-6 pb-6">
            {/* Avatar */}
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 mb-4">
              <Avatar className="w-24 h-24 ring-4 ring-background shadow-lg shrink-0">
                <AvatarFallback className="bg-primary-700 text-white text-2xl font-bold font-display">
                  {getInitials(profile.fullName ?? "A")}
                </AvatarFallback>
              </Avatar>
              <div className="pb-1 flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <h2 className="font-display text-2xl font-bold text-foreground">
                      {profile.fullName}
                    </h2>
                    <p className="text-muted-foreground text-sm mt-0.5">
                      {profile.email}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-primary-500/10 text-primary-600 dark:text-primary-400 shrink-0"
                  >
                    <ShieldCheck className="w-3 h-3 mr-1" />
                    Insurance Agent
                  </Badge>
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 mt-2">
              <StatCard
                icon={ClipboardCheck}
                label="Claims Handled"
                value={profile.totalClaimsHandled}
                color="text-primary-500"
                bg="bg-primary-500/10"
              />
              <StatCard
                icon={MapPin}
                label="District"
                value={profile.assignedDistrict ?? "—"}
                color="text-blue-500"
                bg="bg-blue-500/10"
              />
              <StatCard
                icon={Award}
                label="Agent Code"
                value={profile.agentCode ?? "—"}
                color="text-orange-500"
                bg="bg-orange-500/10"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Details cards ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Personal info */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-border h-full">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-base flex items-center gap-2">
                <User className="w-4 h-4 text-primary-500" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="divide-y divide-border">
                <InfoRow
                  icon={User}
                  label="Full Name"
                  value={profile.fullName}
                />
                <InfoRow
                  icon={Mail}
                  label="Email Address"
                  value={profile.email}
                />
                <InfoRow
                  icon={CheckCircle}
                  label="Verified"
                  value={profile.isVerified}
                  highlight={profile.isVerified}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Agent details */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="border-border h-full">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-base flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary-500" />
                Agent Details
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="divide-y divide-border">
                <InfoRow
                  icon={Hash}
                  label="Agent Code"
                  value={profile.agentCode}
                  highlight
                />
                <InfoRow
                  icon={FileText}
                  label="License Number"
                  value={profile.licenseNumber}
                />
                <InfoRow
                  icon={MapPin}
                  label="Assigned District"
                  value={profile.assignedDistrict}
                />
                <InfoRow
                  icon={ClipboardCheck}
                  label="Total Claims Handled"
                  value={profile.totalClaimsHandled}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ── Account security ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-base flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary-500" />
              Account Security
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/40 border border-border">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary-500/10 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-primary-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Password
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Keep your account secure
                  </p>
                </div>
              </div>
              <Badge
                variant="secondary"
                className="bg-primary-500/10 text-primary-600 dark:text-primary-400"
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                Protected
              </Badge>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
