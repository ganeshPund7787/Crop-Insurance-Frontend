import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Users,
  Phone,
  Mail,
  Eye,
  Filter,
  ChevronUp,
  ChevronDown,
  Clock,
  ShieldCheck,
  Sprout,
  TrendingUp,
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
import { useQuery } from "@tanstack/react-query";
import { adminService } from "../../services/admin.service";
import { getInitials } from "../../lib/utils";
import type { FarmerListItem } from "../../types/admin.types";
import Loader from "../../components/common/Loader";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

// Card entrance animation variants
const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.35, ease: "easeOut" as const },
  }),
};

type SortKey = "fullName" | "createdAtUtc" | "lastLoginAtUtc";
type SortDir = "asc" | "desc";

export default function FarmersList() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("createdAtUtc");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selected, setSelected] = useState<FarmerListItem | null>(null);

  const { data: res, isLoading } = useQuery({
    queryKey: ["admin", "farmers"],
    queryFn: adminService.getAllFarmers,
    select: (r) => r.data,
  });

  const farmers = res ?? [];

  // ── Stats ───────────────────────────────────────────────
  const totalFarmers = farmers.length;

  const stats = [
    {
      label: "Total Farmers",
      value: totalFarmers,
      icon: Users,
      color: "text-primary-500",
      bg: "bg-primary-500/10",
      change: "Registered users",
    },
    {
      label: "Active Policies",
      value: Math.floor(totalFarmers * 0.8),
      icon: ShieldCheck,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      change: "80% coverage rate",
    },
    {
      label: "Total Farms",
      value: farmers.reduce((acc, f) => acc + (f.farmsCount ?? 0), 0),
      icon: Sprout,
      color: "text-green-500",
      bg: "bg-green-500/10",
      change: "Across all farmers",
    },
    {
      label: "Growth",
      value: "+12%",
      icon: TrendingUp,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
      change: "This month",
    },
  ];

  // ── Filter & Sort ────────────────────────────────────────
  const filtered = farmers
    .filter((f) => {
      const q = search.toLowerCase();
      const matchSearch =
        f.fullName.toLowerCase().includes(q) ||
        f.email.toLowerCase().includes(q) ||
        (f.phoneNumber ?? "").includes(q);
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && f.isActive) ||
        (statusFilter === "inactive" && !f.isActive) ||
        (statusFilter === "verified" && f.emailVerified);
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      const valA = a[sortKey] ?? "";
      const valB = b[sortKey] ?? "";
      return sortDir === "asc"
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
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

  if (isLoading) return <Loader />;

  return (
    <div className="space-y-5">
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

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-3"
      >
        <div>
          <h1 className="font-display text-xl font-bold text-foreground">
            Farmers Management
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {farmers.length} registered farmers
          </p>
        </div>
        <Badge
          variant="secondary"
          className="bg-primary-500/10 text-primary-600 dark:text-primary-400 text-sm px-3 py-1"
        >
          <Users className="w-3.5 h-3.5 mr-1.5" />
          {filtered.length} shown
        </Badge>
      </motion.div>

      {/* ── Filters ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
      >
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email or phone..."
                  className="pl-10 h-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-10 w-full sm:w-44">
                  <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Farmers</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="inactive">Inactive Only</SelectItem>
                  <SelectItem value="verified">Email Verified</SelectItem>
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
        transition={{ delay: 0.13 }}
      >
        <Card className="border-border overflow-hidden">
          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-3">🔍</div>
                <p className="text-muted-foreground font-medium">
                  No farmers found
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        <button
                          onClick={() => toggleSort("fullName")}
                          className="flex items-center hover:text-foreground transition-colors"
                        >
                          Farmer <SortIcon col="fullName" />
                        </button>
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">
                        Contact
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">
                        Status
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">
                        <button
                          onClick={() => toggleSort("lastLoginAtUtc")}
                          className="flex items-center hover:text-foreground transition-colors"
                        >
                          Last Login <SortIcon col="lastLoginAtUtc" />
                        </button>
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">
                        <button
                          onClick={() => toggleSort("createdAtUtc")}
                          className="flex items-center hover:text-foreground transition-colors"
                        >
                          Joined <SortIcon col="createdAtUtc" />
                        </button>
                      </th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filtered.map((farmer, i) => (
                      <motion.tr
                        key={farmer.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="hover:bg-accent/40 transition-colors"
                      >
                        {/* Farmer */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Avatar className="w-8 h-8 shrink-0">
                                <AvatarFallback className="bg-primary-700 text-primary-100 text-xs font-bold">
                                  {getInitials(farmer.fullName)}
                                </AvatarFallback>
                              </Avatar>
                              {farmer.isActive && (
                                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-primary-500 border-2 border-background" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-foreground truncate">
                                {farmer.fullName}
                              </p>
                              <p className="text-xs text-muted-foreground truncate md:hidden">
                                {farmer.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="px-4 py-3 hidden md:table-cell">
                          <div className="space-y-0.5">
                            <p className="text-xs text-foreground flex items-center gap-1">
                              <Mail className="w-3 h-3 text-muted-foreground" />
                              {farmer.email}
                            </p>
                            {farmer.phoneNumber && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {farmer.phoneNumber}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <div className="flex flex-col gap-1">
                            <Badge
                              variant="secondary"
                              className={`text-xs w-fit ${
                                farmer.isActive
                                  ? "bg-primary-500/10 text-primary-600 dark:text-primary-400"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {farmer.isActive ? "● Active" : "○ Inactive"}
                            </Badge>
                            <Badge
                              variant="secondary"
                              className={`text-xs w-fit ${
                                farmer.emailVerified
                                  ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {farmer.emailVerified
                                ? "✓ Verified"
                                : "✗ Unverified"}
                            </Badge>
                          </div>
                        </td>

                        {/* Last login */}
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3 text-muted-foreground shrink-0" />
                            <span className="text-xs text-muted-foreground">
                              {farmer.lastLoginAtUtc
                                ? dayjs(farmer.lastLoginAtUtc).fromNow()
                                : "Never"}
                            </span>
                          </div>
                        </td>

                        {/* Joined */}
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <span className="text-xs text-muted-foreground">
                            {dayjs(farmer.createdAtUtc).format("DD MMM YYYY")}
                          </span>
                        </td>

                        {/* Action */}
                        <td className="px-4 py-3 text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelected(farmer)}
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

      {/* ── Detail dialog ── */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Farmer Details</DialogTitle>
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
                <div>
                  <p className="font-display text-lg font-bold text-foreground">
                    {selected.fullName}
                  </p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
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
                    <Badge
                      variant="secondary"
                      className={`text-xs ${
                        selected.emailVerified
                          ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {selected.emailVerified
                        ? "✓ Email Verified"
                        : "✗ Unverified"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3">
                {[
                  {
                    icon: Mail,
                    label: "Email",
                    value: selected.email,
                  },
                  {
                    icon: Phone,
                    label: "Phone",
                    value: selected.phoneNumber ?? "—",
                  },
                  {
                    icon: Clock,
                    label: "Last Login",
                    value: selected.lastLoginAtUtc
                      ? `${dayjs(selected.lastLoginAtUtc).format("DD MMM YYYY, hh:mm A")} (${dayjs(selected.lastLoginAtUtc).fromNow()})`
                      : "Never logged in",
                  },
                ].map((row) => (
                  <div key={row.label} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center shrink-0">
                      <row.icon className="w-4 h-4 text-primary-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {row.label}
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {row.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-xs text-muted-foreground text-center pt-2 border-t border-border">
                Registered on{" "}
                {dayjs(selected.createdAtUtc).format("DD MMMM YYYY")}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
