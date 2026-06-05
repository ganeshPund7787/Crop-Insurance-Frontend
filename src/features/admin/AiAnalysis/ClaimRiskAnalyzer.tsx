import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
  Info,
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
import type { ClaimRiskAnalysisResponse } from "../../../types/aiAnalysis.types";

// ── Zod schema ─────────────────────────────────────────────────────────────
// ── Zod schema ─────────────────────────────────────────────────────────────
const schema = z.object({
  cropName: z.string().min(2, "Crop name is required"),
  season: z.string().min(1, "Season is required"),
  damageType: z.string().min(1, "Damage type is required"),
  damageDescription: z.string().min(20, "Provide at least 20 characters"),
  estimatedLossAmount: z.preprocess(
    (val) => parseFloat(val as string),
    z.number().positive("Must be a positive amount"),
  ),
  farmLocation: z.string().min(3, "Farm location is required"),
  soilType: z.string().min(1, "Soil type is required"),
  farmAreaInAcres: z.preprocess(
    (val) => parseFloat(val as string),
    z.number().positive("Must be a positive number"),
  ),
  incidentDate: z.string().min(1, "Incident date is required"),
  sowingDate: z.string().min(1, "Sowing date is required"),
  expectedHarvestDate: z.string().min(1, "Expected harvest date is required"),
});

type FormValues = {
  cropName: string;
  season: string;
  damageType: string;
  damageDescription: string;
  estimatedLossAmount: number;
  farmLocation: string;
  soilType: string;
  farmAreaInAcres: number;
  incidentDate: string;
  sowingDate: string;
  expectedHarvestDate: string;
};

// ── Risk level config ──────────────────────────────────────────────────────
const riskConfig = {
  Low: {
    color: "text-green-500",
    bg: "bg-green-500/10",
    border: "border-green-500/30",
    bar: "bg-green-500",
  },
  Medium: {
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/30",
    bar: "bg-yellow-500",
  },
  High: {
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
    bar: "bg-orange-500",
  },
  Critical: {
    color: "text-red-500",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    bar: "bg-red-500",
  },
} as const;

const recommendationConfig = {
  Approve: {
    color: "text-green-600",
    bg: "bg-green-500/10",
    icon: CheckCircle2,
  },
  Reject: { color: "text-red-600", bg: "bg-red-500/10", icon: XCircle },
  Investigate: {
    color: "text-yellow-600",
    bg: "bg-yellow-500/10",
    icon: AlertTriangle,
  },
} as const;

// ── Component ──────────────────────────────────────────────────────────────
export default function ClaimRiskAnalyzer() {
  const [result, setResult] = useState<ClaimRiskAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: {
      cropName: "",
      season: "",
      damageType: "",
      damageDescription: "",
      estimatedLossAmount: 0,
      farmLocation: "",
      soilType: "",
      farmAreaInAcres: 0,
      incidentDate: "",
      sowingDate: "",
      expectedHarvestDate: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await aiAnalysisService.analyzeClaimRisk(values);
      setResult(res.data);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          "Failed to analyze claim. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // const riskLevel = result?.riskLevel as keyof typeof riskConfig | undefined;
  // const recommendation = result?.recommendation as
  //   | keyof typeof recommendationConfig
  //   | undefined;
  // const riskStyle = riskLevel ? riskConfig[riskLevel] : null;
  // const recConfig = recommendation
  //   ? recommendationConfig[recommendation]
  //   : null;
  // const RecIcon = recConfig?.icon ?? Info;

  const riskLevel = result?.riskLevel?.trim() as
    | keyof typeof riskConfig
    | undefined;
  const recommendation = result?.recommendation?.trim() as
    | keyof typeof recommendationConfig
    | undefined;
  const riskStyle = riskLevel
    ? (riskConfig[riskLevel] ?? riskConfig["Medium"])
    : null;
  const recConfig = recommendation
    ? (recommendationConfig[recommendation] ??
      recommendationConfig["Investigate"])
    : null;
  const RecIcon = recConfig?.icon ?? Info;

  return (
    <div className="space-y-6">
      {/* ── Section title ── */}
      <div className="flex items-center gap-3">
        <div className="bg-red-500/10 p-2.5 rounded-xl">
          <ShieldAlert className="w-5 h-5 text-red-500" />
        </div>
        <div>
          <h3 className="font-display text-lg font-bold text-foreground">
            Claim Risk Analyzer
          </h3>
          <p className="text-sm text-muted-foreground">
            Fill in claim details — Gemini AI will assess fraud risk and
            recommend an action
          </p>
        </div>
      </div>

      <Separator />

      {/* ── Form ── */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* Row 1 — Crop + Season */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="cropName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Crop Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Wheat, Rice, Cotton" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="season"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Season</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select season" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Kharif">Kharif</SelectItem>
                      <SelectItem value="Rabi">Rabi</SelectItem>
                      <SelectItem value="Zaid">Zaid</SelectItem>
                      <SelectItem value="Annual">Annual</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Row 2 — Damage Type + Estimated Loss */}
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
              name="estimatedLossAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estimated Loss (₹)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g. 85000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Row 3 — Farm Location + Soil Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="farmLocation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Farm Location</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Aurangabad, Maharashtra"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="soilType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Soil Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select soil type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Black Cotton">Black Cotton</SelectItem>
                      <SelectItem value="Alluvial">Alluvial</SelectItem>
                      <SelectItem value="Red Laterite">Red Laterite</SelectItem>
                      <SelectItem value="Sandy Loam">Sandy Loam</SelectItem>
                      <SelectItem value="Clay">Clay</SelectItem>
                      <SelectItem value="Loamy">Loamy</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Row 4 — Farm Area + Incident Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="farmAreaInAcres"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Farm Area (Acres)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 4.5"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="incidentDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Incident Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Row 5 — Sowing + Harvest Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="sowingDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sowing Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expectedHarvestDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expected Harvest Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Damage Description */}
          <FormField
            control={form.control}
            name="damageDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Damage Description</FormLabel>
                <FormControl>
                  <Textarea
                    rows={4}
                    placeholder="Describe the damage in detail — what was observed, extent of loss, any supporting evidence..."
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
                Analyzing with Gemini...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Analyze Claim Risk
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
            className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400"
          >
            <XCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Result Panel ── */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-5"
          >
            <Separator />
            <h4 className="font-display text-base font-bold text-foreground">
              AI Risk Assessment Result
            </h4>

            {/* ── Top row — Score + Recommendation ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Risk Score */}
              <div
                className={`p-5 rounded-2xl border ${riskStyle?.border ?? "border-border"} ${riskStyle?.bg ?? "bg-muted/40"}`}
              >
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  RISK SCORE
                </p>
                <div className="flex items-end gap-2 mb-3">
                  <span
                    className={`font-display text-4xl font-bold ${riskStyle?.color ?? "text-foreground"}`}
                  >
                    {result.riskScore}
                  </span>
                  <span className="text-muted-foreground text-sm mb-1">
                    / 100
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-border overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${result.riskScore}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={`h-full rounded-full ${riskStyle?.bar ?? "bg-primary-500"}`}
                  />
                </div>
                <div className="mt-2">
                  <Badge
                    className={`${riskStyle?.bg ?? "bg-muted"} ${riskStyle?.color ?? "text-foreground"} border-0 text-xs font-semibold`}
                  >
                    {result.riskLevel} Risk
                  </Badge>
                </div>
              </div>

              {/* Recommendation */}
              <div
                className={`p-5 rounded-2xl border ${recConfig?.bg ?? "bg-muted/40"} border-border`}
              >
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  AI RECOMMENDATION
                </p>
                <div className="flex items-center gap-3 mb-3">
                  <RecIcon
                    className={`w-8 h-8 ${recConfig?.color ?? "text-foreground"}`}
                  />
                  <span
                    className={`font-display text-2xl font-bold ${recConfig?.color ?? "text-foreground"}`}
                  >
                    {result.recommendation}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {result.reasoningSummary}
                </p>
              </div>
            </div>

            {/* ── Red Flags ── */}
            {result.redFlags?.length > 0 && (
              <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                    Red Flags Detected
                  </p>
                </div>
                <ul className="space-y-2">
                  {result.redFlags.map((flag, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="flex items-start gap-2 text-sm text-foreground"
                    >
                      <span className="text-red-500 mt-0.5 shrink-0">•</span>
                      {flag}
                    </motion.li>
                  ))}
                </ul>
              </div>
            )}

            {/* ── Positive Indicators ── */}
            {result.positiveIndicators?.length > 0 && (
              <div className="p-4 rounded-2xl bg-green-500/5 border border-green-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                    Positive Indicators
                  </p>
                </div>
                <ul className="space-y-2">
                  {result.positiveIndicators.map((indicator, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="flex items-start gap-2 text-sm text-foreground"
                    >
                      <span className="text-green-500 mt-0.5 shrink-0">•</span>
                      {indicator}
                    </motion.li>
                  ))}
                </ul>
              </div>
            )}

            {/* ── Raw AI Response fallback ── */}
            {result.riskScore === 0 && result.rawAiResponse && (
              <div className="p-4 rounded-2xl bg-muted/40 border border-border">
                <p className="text-xs font-semibold text-muted-foreground mb-2">
                  RAW AI RESPONSE
                </p>
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {result.rawAiResponse}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
