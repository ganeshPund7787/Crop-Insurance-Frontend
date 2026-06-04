import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Users,
  MapPin,
  Phone,
  Mail,
  Eye,
  Sprout,
  Calendar,
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
import { useQuery } from "@tanstack/react-query";
import { agentService } from "../../services/agent.service";
import { getInitials } from "../../lib/utils";
import type { AgentFarmer } from "../../types/agent.types";
import Loader from "../../components/common/Loader";
import dayjs from "dayjs";

export default function AgentFarmers() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<AgentFarmer | null>(null);

  const { data: farmers, isLoading } = useQuery({
    queryKey: ["agent", "farmers"],
    queryFn: agentService.getFarmers,
    select: (r) => r.data,
  });

  const all = farmers ?? [];

  const filtered = all.filter((f) => {
    const q = search.toLowerCase();
    return (
      f.fullName.toLowerCase().includes(q) ||
      f.email.toLowerCase().includes(q) ||
      (f.phoneNumber ?? "").includes(q) ||
      (f.district ?? "").toLowerCase().includes(q) ||
      (f.state ?? "").toLowerCase().includes(q)
    );
  });

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
            District Farmers
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Farmers in your assigned district
          </p>
        </div>
        <Badge
          variant="secondary"
          className="bg-primary-500/10 text-primary-600 dark:text-primary-400 px-3 py-1 text-sm"
        >
          <Users className="w-3.5 h-3.5 mr-1.5" />
          {filtered.length} farmers
        </Badge>
      </motion.div>

      {/* ── Search ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
      >
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, phone, district..."
                className="pl-10 h-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Farmers grid ── */}
      {filtered.length === 0 ? (
        <Card className="border-border">
          <CardContent className="py-16 text-center">
            <div className="text-5xl mb-3">👨‍🌾</div>
            <p className="text-muted-foreground font-medium">
              No farmers found
            </p>
            <p className="text-muted-foreground text-sm mt-1">
              {all.length === 0
                ? "No farmers in your district yet"
                : "Try adjusting your search"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.12 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filtered.map((farmer, i) => (
            <motion.div
              key={farmer.userId}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="border-border hover:border-primary-500/30 hover:shadow-card transition-all group">
                <CardContent className="p-4">
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="w-10 h-10 shrink-0 ring-2 ring-primary-500/20">
                        <AvatarFallback className="bg-primary-700 text-primary-100 text-sm font-bold">
                          {getInitials(farmer.fullName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground text-sm truncate">
                          {farmer.fullName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {farmer.email}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="w-8 h-8 shrink-0 rounded-lg hover:bg-primary-500/10"
                      onClick={() => setSelected(farmer)}
                    >
                      <Eye className="w-4 h-4 text-primary-500" />
                    </Button>
                  </div>

                  {/* Info rows */}
                  <div className="space-y-1.5">
                    {farmer.phoneNumber && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span className="text-xs text-muted-foreground">
                          {farmer.phoneNumber}
                        </span>
                      </div>
                    )}
                    {farmer.state && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span className="text-xs text-muted-foreground">
                          {farmer.district ? `${farmer.district}, ` : ""}
                          {farmer.state}
                        </span>
                      </div>
                    )}
                    {farmer.createdAt && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span className="text-xs text-muted-foreground">
                          Joined {dayjs(farmer.createdAt).format("MMM YYYY")}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Sprout className="w-3.5 h-3.5 text-primary-500" />
                      <span className="text-xs font-medium text-muted-foreground">
                        {farmer.areaInAcres ?? 0} farm
                        {(farmer.areaInAcres ?? 0) !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <Badge
                      variant="secondary"
                      className="text-xs bg-primary-500/10 text-primary-600 dark:text-primary-400"
                    >
                      Farmer
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* ── Farmer detail dialog ── */}
      <Dialog
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
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
                    <Sprout className="w-3 h-3 mr-1" />
                    Farmer
                  </Badge>
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
                    icon: MapPin,
                    label: "Location",
                    value: selected.state
                      ? `${selected.district ? selected.district + ", " : ""}${selected.state}`
                      : "—",
                  },
                  {
                    icon: Sprout,
                    label: "Total Farms",
                    value: `${selected.areaInAcres ?? 0} registered farm${
                      (selected.areaInAcres ?? 0) !== 1 ? "s" : ""
                    }`,
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
