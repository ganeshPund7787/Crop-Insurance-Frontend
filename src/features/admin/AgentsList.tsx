import { useState } from "react";
import { motion } from "framer-motion";
import React from "react";
import {
  Search,
  Shield,
  Phone,
  Mail,
  Eye,
  Filter,
  ChevronUp,
  ChevronDown,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  Award,
  FileText,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { adminService } from "../../services/admin.service";
import { getInitials } from "../../lib/utils";
import type { AgentListItem } from "../../types/admin.types";
import Loader from "../../components/common/Loader";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

// ── Sort types ─────────────────────────────────────────────
type SortKey = "fullName" | "createdAtUtc" | "totalClaimsHandled";
type SortDir = "asc" | "desc";

// ── Detail row component ───────────────────────────────────
function DetailRow({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: React.ElementType;
  label: string;
  value?: string | number | null;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-primary-500" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p
          className={`text-sm font-medium truncate ${
            highlight
              ? "text-primary-600 dark:text-primary-400"
              : "text-foreground"
          }`}
        >
          {value ?? "—"}
        </p>
      </div>
    </div>
  );
}

export default function AgentsList() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("createdAtUtc");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selected, setSelected] = useState<AgentListItem | null>(null);

  // ── Query ──────────────────────────────────────────────
  const {
    data: agents,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["admin", "agents"],
    queryFn: adminService.getAllAgents,
    select: (r) => r.data,
  });

  const allAgents = agents ?? [];

  // ── Summary counts ─────────────────────────────────────
  const verifiedCount = allAgents.filter((a) => a.isVerified).length;
  const activeCount = allAgents.filter((a) => a.isActive).length;

  // ── Filter + sort ──────────────────────────────────────
  const filtered = allAgents
    .filter((a) => {
      const q = search.toLowerCase();
      const matchSearch =
        a.fullName.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        (a.phoneNumber ?? "").includes(q) ||
        (a.agentCode ?? "").toLowerCase().includes(q) ||
        (a.assignedDistrict ?? "").toLowerCase().includes(q) ||
        (a.licenseNumber ?? "").toLowerCase().includes(q);

      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "verified" && a.isVerified) ||
        (statusFilter === "unverified" && !a.isVerified) ||
        (statusFilter === "active" && a.isActive) ||
        (statusFilter === "inactive" && !a.isActive);

      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      const valA = String(a[sortKey] ?? "");
      const valB = String(b[sortKey] ?? "");
      return sortDir === "asc"
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    });

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return null;
    return sortDir === "asc" ? (
      <ChevronUp className="w-3 h-3 inline ml-1" />
    ) : (
      <ChevronDown className="w-3 h-3 inline ml-1" />
    );
  }

  // ── Loading state ──────────────────────────────────────
  if (isLoading) return <Loader />;

  // ── Error state ────────────────────────────────────────
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="text-5xl">😕</div>
        <p className="text-foreground font-semibold">Failed to load agents</p>
        <p className="text-muted-foreground text-sm">
          Could not fetch from /api/admin/agents
        </p>
        <Button variant="outline" onClick={() => refetch()} className="gap-2">
          Try Again
        </Button>
      </div>
    );
  }

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
            Agents Management
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {allAgents.length} registered insurance agents
          </p>
        </div>
        <Badge
          variant="secondary"
          className="bg-primary-500/10 text-primary-600 dark:text-primary-400 text-sm px-3 py-1"
        >
          <Shield className="w-3.5 h-3.5 mr-1.5" />
          {filtered.length} shown
        </Badge>
      </motion.div>

      {/* ── Summary stat cards ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
      >
        {[
          {
            label: "Total Agents",
            value: allAgents.length,
            icon: Shield,
            color: "text-primary-500",
            bg: "bg-primary-500/10",
          },
          {
            label: "Verified",
            value: verifiedCount,
            icon: CheckCircle,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
          },
          {
            label: "Active",
            value: activeCount,
            icon: Award,
            color: "text-green-500",
            bg: "bg-green-500/10",
          },
          {
            label: "Total Claims",
            value: allAgents.reduce(
              (acc, a) => acc + (a.totalClaimsHandled ?? 0),
              0,
            ),
            icon: FileText,
            color: "text-orange-500",
            bg: "bg-orange-500/10",
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

      {/* ── Search + filter ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
      >
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, phone, district, agent code..."
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
                  <SelectItem value="all">All Agents</SelectItem>
                  <SelectItem value="verified">Verified Only</SelectItem>
                  <SelectItem value="unverified">Unverified Only</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="inactive">Inactive Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Table ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.16 }}
      >
        <Card className="border-border overflow-hidden">
          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-3">
                  {allAgents.length === 0 ? "🛡️" : "🔍"}
                </div>
                <p className="text-muted-foreground font-medium">
                  {allAgents.length === 0
                    ? "No agents registered yet"
                    : "No agents match your search"}
                </p>
                {allAgents.length === 0 && (
                  <p className="text-muted-foreground text-sm mt-1">
                    Agents will appear here once registered
                  </p>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      {/* Agent */}
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        <button
                          onClick={() => toggleSort("fullName")}
                          className="flex items-center hover:text-foreground transition-colors"
                        >
                          Agent <SortIcon col="fullName" />
                        </button>
                      </th>
                      {/* Contact */}
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">
                        Contact
                      </th>
                      {/* District */}
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">
                        District
                      </th>
                      {/* Claims */}
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">
                        <button
                          onClick={() => toggleSort("totalClaimsHandled")}
                          className="flex items-center hover:text-foreground transition-colors"
                        >
                          Claims <SortIcon col="totalClaimsHandled" />
                        </button>
                      </th>
                      {/* Status */}
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">
                        Status
                      </th>
                      {/* Joined */}
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">
                        <button
                          onClick={() => toggleSort("createdAtUtc")}
                          className="flex items-center hover:text-foreground transition-colors"
                        >
                          Joined <SortIcon col="createdAtUtc" />
                        </button>
                      </th>
                      {/* Action */}
                      <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-border">
                    {filtered.map((agent, i) => (
                      <motion.tr
                        key={agent.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="hover:bg-accent/40 transition-colors"
                      >
                        {/* Agent */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Avatar className="w-8 h-8 shrink-0">
                                <AvatarFallback className="bg-primary-700 text-primary-100 text-xs font-bold">
                                  {getInitials(agent.fullName)}
                                </AvatarFallback>
                              </Avatar>
                              {agent.isVerified && (
                                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-background" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-foreground truncate">
                                {agent.fullName}
                              </p>
                              {agent.agentCode && (
                                <p className="text-xs text-primary-600 dark:text-primary-400 font-medium">
                                  {agent.agentCode}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="px-4 py-3 hidden md:table-cell">
                          <div className="space-y-0.5">
                            <p className="text-xs text-foreground flex items-center gap-1">
                              <Mail className="w-3 h-3 text-muted-foreground shrink-0" />
                              {agent.email}
                            </p>
                            {agent.phoneNumber && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Phone className="w-3 h-3 shrink-0" />
                                {agent.phoneNumber}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* District */}
                        <td className="px-4 py-3 hidden lg:table-cell">
                          {agent.assignedDistrict ? (
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                              <span className="text-sm text-foreground">
                                {agent.assignedDistrict}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">
                              —
                            </span>
                          )}
                        </td>

                        {/* Claims */}
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <div className="flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            <span className="text-sm font-semibold text-foreground">
                              {agent.totalClaimsHandled}
                            </span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <div className="flex flex-col gap-1">
                            <Badge
                              variant="secondary"
                              className={`text-xs w-fit ${
                                agent.isVerified
                                  ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {agent.isVerified ? "✓ Verified" : "✗ Unverified"}
                            </Badge>
                            {agent.isActive !== undefined && (
                              <Badge
                                variant="secondary"
                                className={`text-xs w-fit ${
                                  agent.isActive
                                    ? "bg-primary-500/10 text-primary-600 dark:text-primary-400"
                                    : "bg-muted text-muted-foreground"
                                }`}
                              >
                                {agent.isActive ? "● Active" : "○ Inactive"}
                              </Badge>
                            )}
                          </div>
                        </td>

                        {/* Joined */}
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <span className="text-xs text-muted-foreground">
                            {agent.createdAtUtc
                              ? dayjs(agent.createdAtUtc).format("DD MMM YYYY")
                              : "—"}
                          </span>
                        </td>

                        {/* Action */}
                        <td className="px-4 py-3 text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelected(agent)}
                            className="h-8 w-8 p-0 rounded-lg hover:bg-primary-500/10"
                          >
                            <Eye className="w-4 h-4 text-primary-500" />
                          </Button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Agent detail dialog ── */}
      <Dialog
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Agent Details</DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="space-y-4">
              {/* Avatar + name */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/40">
                <Avatar className="w-14 h-14">
                  <AvatarFallback className="bg-primary-700 text-white text-xl font-bold">
                    {getInitials(selected.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-display text-lg font-bold text-foreground truncate">
                    {selected.fullName}
                  </p>
                  {selected.agentCode && (
                    <p className="text-sm text-primary-600 dark:text-primary-400 font-medium">
                      {selected.agentCode}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <Badge
                      variant="secondary"
                      className={`text-xs ${
                        selected.isVerified
                          ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {selected.isVerified ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1 inline" />{" "}
                          Verified
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 mr-1 inline" /> Unverified
                        </>
                      )}
                    </Badge>
                    {selected.isActive !== undefined && (
                      <Badge
                        variant="secondary"
                        className={`text-xs ${
                          selected.isActive
                            ? "bg-primary-500/10 text-primary-600 dark:text-primary-400"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {selected.isActive ? "Active" : "Inactive"}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Details */}
              <div className="space-y-3">
                <DetailRow icon={Mail} label="Email" value={selected.email} />
                <DetailRow
                  icon={Phone}
                  label="Phone"
                  value={selected.phoneNumber}
                />
                <DetailRow
                  icon={MapPin}
                  label="Assigned District"
                  value={selected.assignedDistrict}
                  highlight
                />
                <DetailRow
                  icon={Award}
                  label="License Number"
                  value={selected.licenseNumber}
                />
                <DetailRow
                  icon={FileText}
                  label="Total Claims Handled"
                  value={selected.totalClaimsHandled}
                  highlight
                />
                {selected.lastLoginAtUtc && (
                  <DetailRow
                    icon={Clock}
                    label="Last Login"
                    value={`${dayjs(selected.lastLoginAtUtc).format("DD MMM YYYY, hh:mm A")} (${dayjs(selected.lastLoginAtUtc).fromNow()})`}
                  />
                )}
              </div>

              {selected.createdAtUtc && (
                <>
                  <Separator />
                  <p className="text-xs text-muted-foreground text-center">
                    Registered on{" "}
                    {dayjs(selected.createdAtUtc).format("DD MMMM YYYY")}
                  </p>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
