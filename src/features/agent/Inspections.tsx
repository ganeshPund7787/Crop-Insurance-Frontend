import React, { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Search,
  ClipboardCheck,
  Calendar,
  MapPin,
  CheckCircle,
  Clock,
  XCircle,
  Filter,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { agentService } from "../../services/agent.service";
import Loader from "../../components/common/Loader";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import type { Inspection } from "../../types/agent.types";

// ── Zod schema ─────────────────────────────────────────────
const findingsSchema = z.object({
  findings: z
    .string()
    .min(1, "Findings are required")
    .min(20, "Please provide detailed findings (min 20 characters)"),
  recommendation: z.enum(["Approve", "Reject", "Reinspect"] as const, {
    error: "Recommendation is required",
  }),
});
type FindingsForm = z.infer<typeof findingsSchema>;

// ── Status config ──────────────────────────────────────────
type InspectionStatus = "Scheduled" | "Completed" | "Cancelled";

const STATUS_CONFIG: Record<
  InspectionStatus,
  { label: string; className: string; icon: React.ElementType }
> = {
  Scheduled: {
    label: "Scheduled",
    className: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    icon: Clock,
  },
  Completed: {
    label: "Completed",
    className: "bg-primary-500/10 text-primary-600 dark:text-primary-400",
    icon: CheckCircle,
  },
  Cancelled: {
    label: "Cancelled",
    className: "bg-red-500/10 text-red-600 dark:text-red-400",
    icon: XCircle,
  },
};

function InspectionStatusBadge({ status }: { status: InspectionStatus }) {
  const c = STATUS_CONFIG[status] ?? STATUS_CONFIG.Scheduled;
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

// ── Inspection card ────────────────────────────────────────
function InspectionCard({
  inspection,
  onAddFindings,
}: {
  inspection: Inspection;
  onAddFindings: (inspection: Inspection) => void;
}) {
  const isScheduled = inspection.status === "Scheduled";
  const isOverdue =
    isScheduled && dayjs(inspection.scheduledDate).isBefore(dayjs());

  return (
    <Card
      className={`border-border transition-all hover:shadow-card
        ${isOverdue ? "border-red-500/30 bg-red-500/5" : ""}
      `}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5
              ${isOverdue ? "bg-red-500/10" : "bg-primary-500/10"}`}
          >
            <ClipboardCheck
              className={`w-5 h-5 ${
                isOverdue ? "text-red-500" : "text-primary-500"
              }`}
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-foreground text-sm">
                    {inspection.claimNumber}
                  </p>
                  <InspectionStatusBadge
                    status={inspection.status as InspectionStatus}
                  />
                  {isOverdue && (
                    <Badge
                      variant="secondary"
                      className="text-xs bg-red-500/10 text-red-600"
                    >
                      Overdue
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Farmer: {inspection.farmerName}
                </p>
              </div>
            </div>

            {/* Details */}
            <div className="flex items-center gap-4 mt-2 flex-wrap">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                {dayjs(inspection.scheduledDate).format("DD MMM YYYY, hh:mm A")}
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3" />
                {inspection.district}
              </span>
            </div>

            {/* Findings preview */}
            {inspection.findings && (
              <div className="mt-2 p-2.5 rounded-lg bg-muted/50 border border-border">
                <p className="text-xs text-muted-foreground font-medium mb-1">
                  Findings:
                </p>
                <p className="text-xs text-foreground line-clamp-2">
                  {inspection.findings}
                </p>
              </div>
            )}

            {/* Action */}
            {isScheduled && (
              <div className="mt-3">
                <Button
                  size="sm"
                  className="h-8 text-xs bg-primary-600 hover:bg-primary-700 text-white gap-1.5"
                  onClick={() => onAddFindings(inspection)}
                >
                  <ClipboardCheck className="w-3.5 h-3.5" />
                  Add Findings
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Main component ─────────────────────────────────────────
export default function AgentInspections() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<Inspection | null>(null);

  const {
    data: inspections,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ["agent", "inspections"],
    queryFn: agentService.getInspections,
    select: (r) => r.data,
  });

  // ── Findings mutation ──────────────────────────────────
  const { mutate: submitFindings, isPending: isSubmitting } = useMutation({
    mutationFn: (data: FindingsForm) =>
      agentService.updateInspectionFindings(selected!.id, {
        findings: data.findings,
        recommendation: data.recommendation,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agent", "inspections"] });
      queryClient.invalidateQueries({ queryKey: ["agent", "claims"] });
      toast.success("Inspection findings submitted!");
      setSelected(null);
      form.reset();
    },
    onError: () => toast.error("Failed to submit findings"),
  });

  const form = useForm<FindingsForm>({
    resolver: zodResolver(findingsSchema),
    defaultValues: { findings: "", recommendation: "Approve" },
  });

  // ── Filter ─────────────────────────────────────────────
  const all = inspections ?? [];

  const filtered = all.filter((ins) => {
    const q = search.toLowerCase();
    const matchSearch =
      ins.claimNumber.toLowerCase().includes(q) ||
      ins.farmerName.toLowerCase().includes(q) ||
      ins.district.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || ins.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // ── Counts ─────────────────────────────────────────────
  const scheduled = all.filter((i) => i.status === "Scheduled").length;
  const completed = all.filter((i) => i.status === "Completed").length;
  const cancelled = all.filter((i) => i.status === "Cancelled").length;
  const overdue = all.filter(
    (i) => i.status === "Scheduled" && dayjs(i.scheduledDate).isBefore(dayjs()),
  ).length;

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
            Inspections
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Field inspections assigned to you
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isRefetching}
          className="gap-2"
        >
          <Filter className={`w-4 h-4 ${isRefetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
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
            label: "Scheduled",
            value: scheduled,
            color: "text-orange-500",
            bg: "bg-orange-500/10",
            icon: Clock,
          },
          {
            label: "Completed",
            value: completed,
            color: "text-primary-500",
            bg: "bg-primary-500/10",
            icon: CheckCircle,
          },
          {
            label: "Cancelled",
            value: cancelled,
            color: "text-red-500",
            bg: "bg-red-500/10",
            icon: XCircle,
          },
          {
            label: "Overdue",
            value: overdue,
            color: "text-red-600",
            bg: "bg-red-600/10",
            icon: ClipboardCheck,
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
        transition={{ delay: 0.15 }}
      >
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by claim no., farmer, district..."
                  className="pl-10 h-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-10 w-full sm:w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Scheduled">Scheduled</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Inspections list ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-3"
      >
        {filtered.length === 0 ? (
          <Card className="border-border">
            <CardContent className="py-16 text-center">
              <div className="text-5xl mb-3">🔍</div>
              <p className="text-muted-foreground font-medium">
                No inspections found
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                {all.length === 0
                  ? "No inspections scheduled yet"
                  : "Try adjusting your search or filter"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filtered.map((inspection, i) => (
            <motion.div
              key={inspection.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <InspectionCard
                inspection={inspection}
                onAddFindings={(ins) => {
                  setSelected(ins);
                  form.reset({
                    findings: "",
                    recommendation: "Approve",
                  });
                }}
              />
            </motion.div>
          ))
        )}
      </motion.div>

      {/* ── Findings dialog ── */}
      <Dialog
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) {
            setSelected(null);
            form.reset();
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">
              Add Inspection Findings
            </DialogTitle>
            <DialogDescription>
              {selected?.claimNumber} — {selected?.farmerName}
            </DialogDescription>
          </DialogHeader>

          {/* Inspection info */}
          {selected && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border">
              <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Scheduled Date</p>
                <p className="text-sm font-semibold text-foreground">
                  {dayjs(selected.scheduledDate).format("DD MMM YYYY, hh:mm A")}
                </p>
              </div>
            </div>
          )}

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((d) => submitFindings(d))}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="findings"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">
                      Findings <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your field observations in detail. Include crop damage assessment, area affected, cause of damage..."
                        className="resize-none h-32"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="recommendation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">
                      Recommendation <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-11">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Approve">
                          ✅ Approve Claim
                        </SelectItem>
                        <SelectItem value="Reject">❌ Reject Claim</SelectItem>
                        <SelectItem value="Reinspect">
                          🔄 Needs Reinspection
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setSelected(null);
                    form.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-primary-600 hover:bg-primary-700 text-white"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <ClipboardCheck className="w-4 h-4" />
                      Submit Findings
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
