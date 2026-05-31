import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  FileText,
  MapPin,
  Wheat,
  ArrowRight,
  RefreshCw,
  IndianRupee,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { agentService } from "../../services/agent.service";
import { formatINR } from "../../lib/utils";
import { ClaimStatusBadge } from "./Dashboard";
import Loader from "../../components/common/Loader";
import dayjs from "dayjs";
import toast from "react-hot-toast";

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "All Status" },
  { value: "Pending", label: "Pending" },
  { value: "Assigned", label: "Assigned" },
  { value: "UnderInspection", label: "Under Inspection" },
  { value: "Approved", label: "Approved" },
  { value: "Rejected", label: "Rejected" },
  { value: "Closed", label: "Closed" },
];

export default function AgentClaims() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const {
    data: claims,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ["agent", "claims"],
    queryFn: agentService.getClaims,
    select: (r) => r.data,
  });

  // ── Assign claim mutation ──────────────────────────────
  const { mutate: assignClaim, isPending: isAssigning } = useMutation({
    mutationFn: (id: string) => agentService.assignClaim(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agent", "claims"] });
      toast.success("Claim assigned to you successfully!");
    },
    onError: () => toast.error("Failed to assign claim"),
  });

  // ── Filter + search ────────────────────────────────────
  const filtered = (claims ?? []).filter((claim) => {
    const q = search.toLowerCase();
    const matchSearch =
      claim.claimNumber.toLowerCase().includes(q) ||
      claim.farmerName.toLowerCase().includes(q) ||
      claim.cropType.toLowerCase().includes(q) ||
      claim.district.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || claim.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // ── Status counts ──────────────────────────────────────
  const counts = (claims ?? []).reduce(
    (acc, c) => {
      acc[c.status] = (acc[c.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  if (isLoading) return <Loader />;

  return (
    <div className="space-y-5">
      {/* ── Page header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-3"
      >
        <div>
          <h1 className="font-display text-xl font-bold text-foreground">
            Claims
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Claims in your assigned district
          </p>
        </div>
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
      </motion.div>

      {/* ── Status summary pills ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex gap-2 flex-wrap"
      >
        {[
          {
            status: "Pending",
            color: "bg-yellow-500/10  text-yellow-600  dark:text-yellow-400",
          },
          {
            status: "Assigned",
            color: "bg-blue-500/10    text-blue-600    dark:text-blue-400",
          },
          {
            status: "UnderInspection",
            color: "bg-orange-500/10  text-orange-600  dark:text-orange-400",
          },
          {
            status: "Approved",
            color: "bg-primary-500/10 text-primary-600 dark:text-primary-400",
          },
          {
            status: "Rejected",
            color: "bg-red-500/10     text-red-600     dark:text-red-400",
          },
        ].map((s) => (
          <button
            key={s.status}
            onClick={() =>
              setStatusFilter(statusFilter === s.status ? "all" : s.status)
            }
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all
              ${
                statusFilter === s.status
                  ? `${s.color} border-current`
                  : "border-border text-muted-foreground hover:border-current"
              }`}
          >
            {s.status === "UnderInspection" ? "Under Inspection" : s.status}
            {counts[s.status] ? ` (${counts[s.status]})` : " (0)"}
          </button>
        ))}
      </motion.div>

      {/* ── Search + filter ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by claim no., farmer, crop, district..."
                  className="pl-10 h-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-10 w-full sm:w-48">
                  <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Claims list ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="space-y-3"
      >
        {filtered.length === 0 ? (
          <Card className="border-border">
            <CardContent className="py-16 text-center">
              <div className="text-5xl mb-3">📋</div>
              <p className="text-muted-foreground font-medium">
                No claims found
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                Try adjusting your search or filter
              </p>
            </CardContent>
          </Card>
        ) : (
          filtered.map((claim, i) => (
            <motion.div
              key={claim.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="border-border hover:border-primary-500/30 hover:shadow-card transition-all group">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center shrink-0 mt-0.5">
                      <FileText className="w-5 h-5 text-primary-500" />
                    </div>

                    {/* Main info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-foreground text-sm">
                              {claim.claimNumber}
                            </p>
                            <ClaimStatusBadge status={claim.status} />
                          </div>
                          <p className="text-muted-foreground text-xs mt-0.5">
                            Farmer: {claim.farmerName}
                          </p>
                        </div>
                        <p className="font-display text-lg font-bold text-foreground shrink-0">
                          {formatINR(claim.claimAmount)}
                        </p>
                      </div>

                      {/* Details row */}
                      <div className="flex items-center gap-4 mt-2 flex-wrap">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Wheat className="w-3 h-3" />
                          {claim.cropType}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          {claim.district}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          🗓️ {dayjs(claim.incidentDate).format("DD MMM YYYY")}
                        </span>
                      </div>

                      {/* Actions row */}
                      <div className="flex items-center gap-2 mt-3 flex-wrap">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs gap-1.5 text-primary-600 border-primary-500/30 hover:bg-primary-500/5"
                          onClick={() => navigate(`/agent/claims/${claim.id}`)}
                        >
                          View Details
                          <ArrowRight className="w-3 h-3" />
                        </Button>

                        {claim.status === "Pending" && (
                          <Button
                            size="sm"
                            className="h-8 text-xs bg-primary-600 hover:bg-primary-700 text-white gap-1.5"
                            disabled={isAssigning}
                            onClick={() => assignClaim(claim.id)}
                          >
                            {isAssigning ? (
                              <motion.span
                                animate={{ rotate: 360 }}
                                transition={{
                                  duration: 1,
                                  repeat: Infinity,
                                  ease: "linear",
                                }}
                                className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full inline-block"
                              />
                            ) : (
                              "＋ Assign to Me"
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* ── Summary footer ── */}
      {filtered.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-border bg-muted/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <IndianRupee className="w-4 h-4 text-primary-500" />
                  <span className="text-sm font-semibold text-foreground">
                    Total Claim Value:
                  </span>
                  <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
                    {formatINR(
                      filtered.reduce((acc, c) => acc + c.claimAmount, 0),
                    )}
                  </span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {filtered.length} claims shown
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
