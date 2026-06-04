import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Loader2,
  XCircle,
  CheckCircle2,
  ClipboardList,
  BadgeIndianRupee,
  MapPin,
  Eye,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { aiAnalysisService } from "../../../services/aiAnalysis.service";
import type { DamageReportResponse } from "../../../types/aiAnalysis.types";

// ── Zod schema ─────────────────────────────────────────────────────────────
// ── Zod schema ─────────────────────────────────────────────────────────────
const schema = z.object({
  inspectionNumber: z.string().min(1, "Inspection number is required"),
  inspectionDate: z.string().min(1, "Inspection date is required"),
  agentName: z.string().optional(),
  cropName: z.string().min(2, "Crop name is required"),
  damageType: z.string().min(1, "Damage type is required"),
  damagePercentage: z.preprocess(
    (val) => parseFloat(val as string),
    z.number().min(1, "Must be at least 1%").max(100, "Cannot exceed 100%"),
  ),
  recommendedAmount: z.preprocess(
    (val) => parseFloat(val as string),
    z.number().positive("Must be a positive amount"),
  ),
  farmLocation: z.string().min(3, "Farm location is required"),
  rawFindings: z.string().min(30, "Please provide at least 30 characters"),
});

type FormValues = {
  inspectionNumber: string;
  inspectionDate: string;
  agentName?: string;
  cropName: string;
  damageType: string;
  damagePercentage: number;
  recommendedAmount: number;
  farmLocation: string;
  rawFindings: string;
};

// ── Recommended action config ──────────────────────────────────────────────
const actionConfig: Record<
  string,
  { color: string; bg: string; border: string }
> = {
  "Approve Claim": {
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/30",
  },
  "Reject Claim": {
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
  },
  "Partial Approval": {
    color: "text-yellow-600 dark:text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/30",
  },
  "Request Re-inspection": {
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
  },
};

const getActionStyle = (action: string) =>
  actionConfig[action] ?? {
    color: "text-muted-foreground",
    bg: "bg-muted/40",
    border: "border-border",
  };

// ── Component ──────────────────────────────────────────────────────────────
export default function DamageReportSummarizer() {
  const [result, setResult] = useState<DamageReportResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: {
      inspectionNumber: "",
      inspectionDate: "",
      agentName: "",
      cropName: "",
      damageType: "",
      damagePercentage: 0,
      recommendedAmount: 0,
      farmLocation: "",
      rawFindings: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await aiAnalysisService.summarizeDamageReport({
        ...values,
        agentName: values.agentName || undefined,
      });
      setResult(res.data);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          "Failed to generate report. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const actionStyle = result ? getActionStyle(result.recommendedAction) : null;

  return (
    <div className="space-y-6">
      {/* ── Section title ── */}
      <div className="flex items-center gap-3">
        <div className="bg-blue-500/10 p-2.5 rounded-xl">
          <FileText className="w-5 h-5 text-blue-500" />
        </div>
        <div>
          <h3 className="font-display text-lg font-bold text-foreground">
            Damage Report Summarizer
          </h3>
          <p className="text-sm text-muted-foreground">
            Paste raw agent field notes — Gemini converts them into a formal
            professional report
          </p>
        </div>
      </div>

      <Separator />

      {/* ── Form ── */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* Row 1 — Inspection Number + Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="inspectionNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Inspection Number</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. INS-20250042" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="inspectionDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Inspection Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Row 2 — Agent Name + Crop Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="agentName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Agent Name
                    <span className="text-muted-foreground ml-1 font-normal">
                      (optional)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Rajesh Patil" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cropName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Crop Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Soybean, Cotton" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Row 3 — Damage Type + Damage Percentage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="damageType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Damage Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select damage type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Flood">Flood</SelectItem>
                      <SelectItem value="Drought">Drought</SelectItem>
                      <SelectItem value="Hailstorm">Hailstorm</SelectItem>
                      <SelectItem value="Pest">Pest</SelectItem>
                      <SelectItem value="Disease">Disease</SelectItem>
                      <SelectItem value="Fire">Fire</SelectItem>
                      <SelectItem value="Cyclone">Cyclone</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="damagePercentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Damage Percentage (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={100}
                      placeholder="e.g. 65"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Row 4 — Recommended Amount + Farm Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="recommendedAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recommended Payout (₹)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g. 72000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="farmLocation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Farm Location</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Latur, Maharashtra" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Raw findings */}
          <FormField
            control={form.control}
            name="rawFindings"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Raw Field Notes / Agent Findings</FormLabel>
                <FormControl>
                  <Textarea
                    rows={6}
                    placeholder={
                      "Paste the agent's raw inspection notes here...\n\n" +
                      "e.g. visited farm on 12th, saw standing water in 3 plots, " +
                      "crop fully submerged near eastern boundary, soil very wet, " +
                      "approx 70% damage, roots rotted, farmer showed photos, " +
                      "recommended payout of 72000..."
                    }
                    className="resize-none font-mono text-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto gap-2 bg-primary-600 hover:bg-primary-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating Report...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Formal Report
              </>
            )}
          </Button>
        </form>
      </Form>

      {/* ── Error ── */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 p-4 rounded-xl
              bg-red-500/10 border border-red-500/20
              text-red-600 dark:text-red-400"
          >
            <XCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Result — Formal Report Card ── */}
      <AnimatePresence>
        {result && actionStyle && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <Separator />

            {/* Report header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h4 className="font-display text-base font-bold text-foreground">
                Generated Damage Assessment Report
              </h4>
              <Badge
                className={`
                  ${actionStyle.bg} ${actionStyle.color}
                  ${actionStyle.border} border text-xs font-semibold px-3 py-1
                `}
              >
                {result.recommendedAction}
              </Badge>
            </div>

            {/* ── Executive Summary ── */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="p-5 rounded-2xl bg-primary-500/5 border border-primary-500/20"
            >
              <div className="flex items-center gap-2 mb-3">
                <Eye className="w-4 h-4 text-primary-500" />
                <p
                  className="text-sm font-semibold text-primary-600
                  dark:text-primary-400"
                >
                  Executive Summary
                </p>
              </div>
              <p className="text-sm text-foreground leading-relaxed">
                {result.executiveSummary}
              </p>
            </motion.div>

            {/* ── Damage Assessment + Financial Impact ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-5 rounded-2xl bg-orange-500/5 border border-orange-500/20"
              >
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-orange-500" />
                  <p
                    className="text-sm font-semibold text-orange-600
                    dark:text-orange-400"
                  >
                    Damage Assessment
                  </p>
                </div>
                <p className="text-sm text-foreground leading-relaxed">
                  {result.damageAssessment}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="p-5 rounded-2xl bg-green-500/5 border border-green-500/20"
              >
                <div className="flex items-center gap-2 mb-3">
                  <BadgeIndianRupee className="w-4 h-4 text-green-500" />
                  <p
                    className="text-sm font-semibold text-green-600
                    dark:text-green-400"
                  >
                    Financial Impact
                  </p>
                </div>
                <p className="text-sm text-foreground leading-relaxed">
                  {result.financialImpact}
                </p>
              </motion.div>
            </div>

            {/* ── Key Observations ── */}
            {result.keyObservations.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-5 rounded-2xl bg-accent/40 border border-border"
              >
                <div className="flex items-center gap-2 mb-3">
                  <ClipboardList className="w-4 h-4 text-foreground" />
                  <p className="text-sm font-semibold text-foreground">
                    Key Observations
                  </p>
                </div>
                <ul className="space-y-2">
                  {result.keyObservations.map((obs, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.22 + i * 0.06 }}
                      className="flex items-start gap-2 text-sm text-foreground"
                    >
                      <CheckCircle2 className="w-4 h-4 text-primary-500 shrink-0 mt-0.5" />
                      {obs}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* ── Inspector Conclusion ── */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28 }}
              className="p-5 rounded-2xl bg-muted/40 border border-border"
            >
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm font-semibold text-foreground">
                  Inspector's Conclusion
                </p>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed italic">
                "{result.inspectorConclusion}"
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
