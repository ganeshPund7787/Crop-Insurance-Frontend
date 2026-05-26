import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Users,
  MapPin,
  Phone,
  Mail,
  Filter,
  ChevronUp,
  ChevronDown,
  Eye,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

type SortKey = "fullName" | "createdAt" | "state";
type SortDir = "asc" | "desc";

export default function FarmersList() {
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selected, setSelected] = useState<FarmerListItem | null>(null);

  const { data: res, isLoading } = useQuery({
    queryKey: ["admin", "farmers"],
    queryFn: adminService.getAllFarmers,
    select: (r) => r.data,
  });

  const farmers = res ?? [];

  // Unique states for filter
  const uniqueStates = Array.from(
    new Set(farmers.map((f) => f.state).filter(Boolean)),
  ) as string[];

  // Filter + sort
  const filtered = farmers
    .filter((f) => {
      const q = search.toLowerCase();
      const matchSearch =
        f.fullName.toLowerCase().includes(q) ||
        f.email.toLowerCase().includes(q) ||
        (f.phoneNumber ?? "").includes(q) ||
        (f.district ?? "").toLowerCase().includes(q);
      const matchState = stateFilter === "all" || f.state === stateFilter;
      return matchSearch && matchState;
    })
    .sort((a, b) => {
      let valA = a[sortKey] ?? "";
      let valB = b[sortKey] ?? "";
      if (sortKey === "createdAt") {
        valA = new Date(valA).getTime().toString();
        valB = new Date(valB).getTime().toString();
      }
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
        transition={{ delay: 0.1 }}
      >
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, phone, district..."
                  className="pl-10 h-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* State filter */}
              <Select value={stateFilter} onValueChange={setStateFilter}>
                <SelectTrigger className="h-10 w-full sm:w-48">
                  <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Filter by state" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States</SelectItem>
                  {uniqueStates.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
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
        transition={{ delay: 0.15 }}
      >
        <Card className="border-border overflow-hidden">
          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-3">🔍</div>
                <p className="text-muted-foreground font-medium">
                  No farmers found
                </p>
                <p className="text-muted-foreground text-sm mt-1">
                  Try adjusting your search or filter
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
                        <button
                          onClick={() => toggleSort("state")}
                          className="flex items-center hover:text-foreground transition-colors"
                        >
                          Location <SortIcon col="state" />
                        </button>
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">
                        <button
                          onClick={() => toggleSort("createdAt")}
                          className="flex items-center hover:text-foreground transition-colors"
                        >
                          Joined <SortIcon col="createdAt" />
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
                        key={farmer.userId}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="hover:bg-accent/40 transition-colors"
                      >
                        {/* Farmer */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8 shrink-0">
                              <AvatarFallback className="bg-primary-700 text-primary-100 text-xs font-bold">
                                {getInitials(farmer.fullName)}
                              </AvatarFallback>
                            </Avatar>
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

                        {/* Location */}
                        <td className="px-4 py-3 hidden lg:table-cell">
                          {farmer.state ? (
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                              <span className="text-sm text-foreground">
                                {farmer.district ? `${farmer.district}, ` : ""}
                                {farmer.state}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">
                              —
                            </span>
                          )}
                        </td>

                        {/* Joined */}
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <span className="text-sm text-muted-foreground">
                            {farmer.createdAt
                              ? dayjs(farmer.createdAt).format("DD MMM YYYY")
                              : "—"}
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

      {/* ── Farmer detail dialog ── */}
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
                  <Badge
                    variant="secondary"
                    className="mt-1 bg-primary-500/10 text-primary-600 dark:text-primary-400"
                  >
                    {selected.role}
                  </Badge>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3">
                {[
                  { icon: Mail, label: "Email", value: selected.email },
                  {
                    icon: Phone,
                    label: "Phone",
                    value: selected.phoneNumber ?? "—",
                  },
                  {
                    icon: MapPin,
                    label: "Location",
                    value: selected.state
                      ? `${selected.district ?? ""} ${selected.district ? "," : ""} ${selected.state}`
                      : "—",
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

              {/* Joined */}
              {selected.createdAt && (
                <p className="text-xs text-muted-foreground text-center pt-2 border-t border-border">
                  Registered on{" "}
                  {dayjs(selected.createdAt).format("DD MMMM YYYY")}
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
