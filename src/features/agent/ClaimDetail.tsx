import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  FileText,
  User,
  MapPin,
  Wheat,
  Calendar,
  IndianRupee,
  ClipboardCheck,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  Droplets,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { formatINR } from "../../lib/utils";
import { ClaimStatusBadge } from "./Dashboard";
import Loader from "../../components/common/Loader";
import dayjs from "dayjs";
import toast from "react-hot-toast";

// ── Zod schemas ────────────────────────────────────────────
const inspectionSchema = z.object({
  scheduledDate: z.string().min(1, "Inspection date is required"),
  notes: z.string().optional(),
});

const findingsSchema = z.object({
  findings: z
    .string()
    .min(1, "Findings are required")
    .min(20, "Please provide detailed findings (min 20 characters)"),
  recommendation: z.enum(["Approve", "Reject", "Reinspect"] as const, {
    error: "Recommendation is required",
  }),
});

const approveSchema = z.object({
  approvedAmount: z
    .string()
    .min(1, "Approved amount is required")
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) > 0,
      "Amount must be a positive number",
    ),
  remarks: z.string().optional(),
});

type InspectionForm = z.infer<typeof inspectionSchema>;
type FindingsForm = z.infer<typeof findingsSchema>;
type ApproveForm = z.infer<typeof approveSchema>;

// ── Detail row ─────────────────────────────────────────────
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
    <div className="flex items-center gap-3 py-2.5">
      <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center shrink-0">
        <Icon className="w-3.5 h-3.5 text-primary-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p
          className={`text-sm font-semibold mt-0.5 truncate ${
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

export default function AgentClaimDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [inspectionOpen, setInspectionOpen] = useState(false);
  const [findingsOpen, setFindingsOpen] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);

  // ── Query ──────────────────────────────────────────────
  const { data: claim, isLoading } = useQuery({
    queryKey: ["agent", "claim", id],
    queryFn: () => agentService.getClaimById(id!),
    enabled: !!id,
    select: (r) => r.data,
  });

  // ── Helpers ────────────────────────────────────────────
  // Get the latest scheduled inspection (for findings)
  const scheduledInspection = claim?.inspections?.find(
    (i) => i.status?.toLowerCase() === "scheduled",
  );

  const latestInspection =
    claim?.inspections?.[(claim.inspections.length ?? 1) - 1];

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["agent", "claim", id] });
    queryClient.invalidateQueries({ queryKey: ["agent", "claims"] });
    queryClient.invalidateQueries({ queryKey: ["agent", "inspections"] });
  }

  // ── Assign ─────────────────────────────────────────────
  const { mutate: assignClaim, isPending: isAssigning } = useMutation({
    mutationFn: () => agentService.assignClaim(id!),
    onSuccess: () => {
      invalidate();
      toast.success("Claim assigned to you!");
    },
    onError: () => toast.error("Failed to assign claim"),
  });

  // ── Schedule inspection ────────────────────────────────
  const { mutate: scheduleInspection, isPending: isScheduling } = useMutation({
    mutationFn: (payload: InspectionForm) =>
      agentService.scheduleInspection(id!, {
        scheduledDate: payload.scheduledDate,
        notes: payload.notes,
      }),
    onSuccess: () => {
      invalidate();
      toast.success("Inspection scheduled!");
      setInspectionOpen(false);
      inspectionForm.reset();
    },
    onError: () => toast.error("Failed to schedule inspection"),
  });

  // ── Submit findings ────────────────────────────────────
  // ✅ Uses scheduledInspection.id — NOT claim id
  const { mutate: submitFindings, isPending: isSubmittingFindings } =
    useMutation({
      mutationFn: (payload: FindingsForm) => {
        if (!scheduledInspection)
          throw new Error("No scheduled inspection found");
        return agentService.updateInspectionFindings(
          scheduledInspection.id, // ✅ inspection ID
          {
            findings: payload.findings,
            recommendation: payload.recommendation,
          },
        );
      },
      onSuccess: () => {
        invalidate();
        toast.success("Findings submitted!");
        setFindingsOpen(false);
        findingsForm.reset();
      },
      onError: () => toast.error("Failed to submit findings"),
    });

  // ── Approve claim ──────────────────────────────────────
  const { mutate: approveClaim, isPending: isApproving } = useMutation({
    mutationFn: (payload: ApproveForm) =>
      agentService.approveClaim(id!, {
        approvedAmount: Number(payload.approvedAmount),
        remarks: payload.remarks,
      }),
    onSuccess: () => {
      invalidate();
      toast.success("Claim approved!");
      setApproveOpen(false);
      approveForm.reset();
    },
    onError: () => toast.error("Failed to approve claim"),
  });

  // ── Forms ──────────────────────────────────────────────
  const inspectionForm = useForm<InspectionForm>({
    resolver: zodResolver(inspectionSchema),
    defaultValues: { scheduledDate: "", notes: "" },
  });

  const findingsForm = useForm<FindingsForm>({
    resolver: zodResolver(findingsSchema),
    defaultValues: { findings: "", recommendation: "Approve" },
  });

  const approveForm = useForm<ApproveForm>({
    resolver: zodResolver(approveSchema),
    defaultValues: { approvedAmount: "", remarks: "" },
  });

  if (isLoading) return <Loader />;

  if (!claim) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-3">😕</div>
        <p className="text-muted-foreground font-medium">Claim not found</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>
    );
  }

  // ── Action visibility ──────────────────────────────────
  const status = claim.status?.toLowerCase().trim();

  // Assign: claim just submitted
  const canAssign = status === "submitted";

  // Schedule: after agent assigns — backend may return
  // "assigned" OR "underreview" depending on your API
  const canSchedule = status === "assigned" || status === "underreview";

  // Add findings: only when a Scheduled inspection exists
  const canAddFindings = status === "underinspection" && !!scheduledInspection;

  // Approve: claim is under inspection
  const canApprove = status === "underinspection";

  // Terminal: no actions available
  const isTerminal = ["approved", "rejected", "closed"].includes(status);

  console.log("status after assign:", status, {
    canAssign,
    canSchedule,
    canAddFindings,
    canApprove,
    isTerminal,
  });
  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-display text-xl font-bold text-foreground">
              {claim.claimNumber}
            </h1>
            <ClaimStatusBadge status={claim.status} />
          </div>
          <p className="text-muted-foreground text-sm mt-0.5">
            Filed on {dayjs(claim.createdAtUtc).format("DD MMMM YYYY, hh:mm A")}
          </p>
        </div>
      </motion.div>

      {/* ── Actions bar ── */}
      {!isTerminal && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
        >
          <Card className="border-border bg-muted/30">
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Available Actions
              </p>
              <div className="flex gap-2 flex-wrap">
                {canAssign && (
                  <Button
                    size="sm"
                    className="bg-primary-600 hover:bg-primary-700 text-white gap-2"
                    disabled={isAssigning}
                    onClick={() => assignClaim()}
                  >
                    {isAssigning ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <FileText className="w-4 h-4" />
                    )}
                    Assign to Me
                  </Button>
                )}

                {canSchedule && (
                  <Button
                    size="sm"
                    className="bg-orange-500 hover:bg-orange-600 text-white gap-2"
                    onClick={() => setInspectionOpen(true)}
                  >
                    <Calendar className="w-4 h-4" />
                    Schedule Inspection
                  </Button>
                )}

                {canAddFindings && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2 border-orange-500/30 text-orange-600 hover:bg-orange-500/5"
                    onClick={() => setFindingsOpen(true)}
                  >
                    <ClipboardCheck className="w-4 h-4" />
                    Add Findings
                  </Button>
                )}

                {canApprove && (
                  <Button
                    size="sm"
                    className="bg-primary-600 hover:bg-primary-700 text-white gap-2"
                    onClick={() => {
                      approveForm.setValue(
                        "approvedAmount",
                        claim.estimatedLossAmount?.toString() ?? "",
                      );
                      setApproveOpen(true);
                    }}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve Claim
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ── Two column layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Claim info */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
        >
          <Card className="border-border h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary-500" />
                Claim Information
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="divide-y divide-border">
                <DetailRow
                  icon={FileText}
                  label="Claim Number"
                  value={claim.claimNumber}
                />
                <DetailRow
                  icon={Droplets}
                  label="Damage Type"
                  value={claim.damageType}
                />
                <DetailRow
                  icon={IndianRupee}
                  label="Estimated Loss"
                  value={formatINR(claim.estimatedLossAmount)}
                  highlight
                />
                {claim.approvedAmount ? (
                  <DetailRow
                    icon={CheckCircle}
                    label="Approved Amount"
                    value={formatINR(claim.approvedAmount)}
                    highlight
                  />
                ) : null}
                <DetailRow
                  icon={AlertCircle}
                  label="Incident Date"
                  value={dayjs(claim.incidentDate).format("DD MMM YYYY")}
                />
                <DetailRow
                  icon={Clock}
                  label="Filed On"
                  value={dayjs(claim.createdAtUtc).format("DD MMM YYYY")}
                />
              </div>

              {claim.damageDescription && (
                <div className="mt-3 p-3 rounded-xl bg-muted/40 border border-border">
                  <p className="text-xs font-semibold text-muted-foreground mb-1">
                    Damage Description
                  </p>
                  <p className="text-sm text-foreground leading-relaxed">
                    {claim.damageDescription}
                  </p>
                </div>
              )}

              {claim.agentRemarks && (
                <div className="mt-2 p-3 rounded-xl bg-primary-500/5 border border-primary-500/20">
                  <p className="text-xs font-semibold text-primary-600 dark:text-primary-400 mb-1">
                    Agent Remarks
                  </p>
                  <p className="text-sm text-foreground leading-relaxed">
                    {claim.agentRemarks}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Farmer + farm info */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.17 }}
        >
          <Card className="border-border h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <User className="w-4 h-4 text-primary-500" />
                Farmer & Crop Details
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="divide-y divide-border">
                <DetailRow
                  icon={User}
                  label="Farmer Name"
                  value={claim.farmerName}
                />
                <DetailRow
                  icon={User}
                  label="Email"
                  value={claim.farmerEmail}
                />
                <DetailRow
                  icon={User}
                  label="Phone"
                  value={claim.farmerPhone}
                />
                <DetailRow
                  icon={MapPin}
                  label="District"
                  value={claim.district}
                />
                {claim.village && (
                  <DetailRow
                    icon={MapPin}
                    label="Village"
                    value={claim.village}
                  />
                )}
                <DetailRow icon={Wheat} label="Crop" value={claim.cropName} />
                {claim.season && (
                  <DetailRow
                    icon={Calendar}
                    label="Season"
                    value={claim.season}
                  />
                )}
                {claim.expectedYieldTons && (
                  <DetailRow
                    icon={Wheat}
                    label="Expected Yield"
                    value={`${claim.expectedYieldTons} tons`}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ── Inspections list ── */}
      {claim.inspections && claim.inspections.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
        >
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4 text-primary-500" />
                Inspections
                <Badge
                  variant="secondary"
                  className="ml-auto text-xs bg-primary-500/10 text-primary-600 dark:text-primary-400"
                >
                  {claim.inspections.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-3">
              {claim.inspections.map((ins) => (
                <div
                  key={ins.id}
                  className="p-4 rounded-xl border border-border bg-muted/20"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">
                        {ins.inspectionNumber}
                      </span>
                      <Badge
                        variant="secondary"
                        className={`text-xs ${
                          ins.status === "Completed"
                            ? "bg-primary-500/10 text-primary-600 dark:text-primary-400"
                            : ins.status === "Scheduled"
                              ? "bg-orange-500/10 text-orange-600 dark:text-orange-400"
                              : "bg-red-500/10 text-red-600"
                        }`}
                      >
                        {ins.status}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {dayjs(ins.scheduledAtUtc).format("DD MMM YYYY")}
                    </span>
                  </div>

                  {ins.location && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                      <MapPin className="w-3 h-3" />
                      {ins.location}
                    </p>
                  )}

                  {ins.findings && (
                    <div className="mt-2 p-3 rounded-lg bg-primary-500/5 border border-primary-500/20">
                      <p className="text-xs font-semibold text-primary-600 dark:text-primary-400 mb-1">
                        Findings
                      </p>
                      <p className="text-xs text-foreground leading-relaxed">
                        {ins.findings}
                      </p>
                      {ins.damagePercentage != null && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Damage: {ins.damagePercentage}% — Recommended:{" "}
                          {ins.recommendedAmount
                            ? formatINR(ins.recommendedAmount)
                            : "—"}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ══════════════════════════════════════════
          DIALOGS
      ══════════════════════════════════════════ */}

      {/* Schedule Inspection */}
      <Dialog open={inspectionOpen} onOpenChange={setInspectionOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">
              Schedule Inspection
            </DialogTitle>
            <DialogDescription>
              Set a date for field inspection of {claim.claimNumber}
            </DialogDescription>
          </DialogHeader>
          <Form {...inspectionForm}>
            <form
              onSubmit={inspectionForm.handleSubmit((d) =>
                scheduleInspection(d),
              )}
              className="space-y-4"
            >
              <FormField
                control={inspectionForm.control}
                name="scheduledDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">
                      Date & Time <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        className="h-11"
                        min={new Date().toISOString().slice(0, 16)}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={inspectionForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">
                      Notes{" "}
                      <span className="text-muted-foreground font-normal">
                        (optional)
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any specific instructions..."
                        className="resize-none h-24"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setInspectionOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isScheduling}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                >
                  {isScheduling ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Schedule"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Add Findings */}
      <Dialog open={findingsOpen} onOpenChange={setFindingsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">
              Add Inspection Findings
            </DialogTitle>
            <DialogDescription>
              {scheduledInspection?.inspectionNumber} — {claim.claimNumber}
            </DialogDescription>
          </DialogHeader>

          {scheduledInspection && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/40 border border-border">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Scheduled</p>
                <p className="text-sm font-semibold text-foreground">
                  {dayjs(scheduledInspection.scheduledAtUtc).format(
                    "DD MMM YYYY, hh:mm A",
                  )}
                </p>
              </div>
            </div>
          )}

          <Form {...findingsForm}>
            <form
              onSubmit={findingsForm.handleSubmit((d) => submitFindings(d))}
              className="space-y-4"
            >
              <FormField
                control={findingsForm.control}
                name="findings"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">
                      Findings <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe field observations in detail..."
                        className="resize-none h-32"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={findingsForm.control}
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
                  onClick={() => setFindingsOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingFindings}
                  className="flex-1 bg-primary-600 hover:bg-primary-700 text-white"
                >
                  {isSubmittingFindings ? (
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

      {/* Approve Claim */}
      <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Approve Claim</DialogTitle>
            <DialogDescription>
              Confirm approved amount for {claim.claimNumber}
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border">
            <span className="text-sm text-muted-foreground">
              Estimated Loss
            </span>
            <span className="font-bold text-foreground">
              {formatINR(claim.estimatedLossAmount)}
            </span>
          </div>

          {latestInspection?.recommendedAmount && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-primary-500/5 border border-primary-500/20">
              <span className="text-sm text-muted-foreground">
                Inspector Recommended
              </span>
              <span className="font-bold text-primary-600 dark:text-primary-400">
                {formatINR(latestInspection.recommendedAmount)}
              </span>
            </div>
          )}

          <Form {...approveForm}>
            <form
              onSubmit={approveForm.handleSubmit((d) => approveClaim(d))}
              className="space-y-4"
            >
              <FormField
                control={approveForm.control}
                name="approvedAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">
                      Approved Amount (₹){" "}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Enter approved amount"
                          className="pl-10 h-11"
                          type="number"
                          min="1"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={approveForm.control}
                name="remarks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">
                      Remarks{" "}
                      <span className="text-muted-foreground font-normal">
                        (optional)
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Remarks for approval..."
                        className="resize-none h-20"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setApproveOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isApproving}
                  className="flex-1 bg-primary-600 hover:bg-primary-700 text-white gap-2"
                >
                  {isApproving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </>
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
