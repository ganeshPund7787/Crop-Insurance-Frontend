import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Brain,
  AlertTriangle,
  ShieldCheck,
  Lightbulb,
  FileText,
  Loader2,
  RotateCcw,
  MapPin,
  Wheat,
  Calendar,
  Ruler,
  MessageSquare,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useMutation } from "@tanstack/react-query";
import api from "../../lib/axios";
import toast from "react-hot-toast";

// ── Types ──────────────────────────────────────────────────
interface AiRiskSummaryResponse {
  riskLevel: "Low" | "Medium" | "High" | "Critical";
  possibleRisks: string[];
  recommendations: string[];
  insuranceSuggestions: string[];
}

// ── Zod schema ─────────────────────────────────────────────
const riskFormSchema = z.object({
  cropName: z.string().min(1, "Crop name is required"),
  district: z
    .string()
    .min(2, "District is required")
    .max(100, "District name too long"),
  season: z
    .enum(["Kharif", "Rabi", "Zaid", "Annual"] as const)
    .refine((val) => val !== undefined, { message: "Please select a season" }),
  landArea: z
    .string()
    .min(1, "Land area is required")
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) > 0,
      "Must be a positive number",
    ),
  problemDescription: z
    .string()
    .max(1000, "Maximum 1000 characters")
    .optional(),
});

type RiskForm = z.infer<typeof riskFormSchema>;

// ── Static data ────────────────────────────────────────────
const CROP_TYPES = [
  "Rice",
  "Wheat",
  "Sugarcane",
  "Cotton",
  "Soybean",
  "Maize",
  "Jowar",
  "Bajra",
  "Tur (Arhar)",
  "Gram (Chana)",
  "Groundnut",
  "Sunflower",
  "Onion",
  "Tomato",
  "Potato",
  "Banana",
  "Mango",
  "Grapes",
  "Orange",
  "Pomegranate",
  "Other",
];

const SEASONS = [
  { value: "Kharif", label: "Kharif (Jun – Oct)", emoji: "🌧️" },
  { value: "Rabi", label: "Rabi (Nov – Apr)", emoji: "❄️" },
  { value: "Zaid", label: "Zaid (Apr – Jun)", emoji: "☀️" },
  { value: "Annual", label: "Annual (Year-round)", emoji: "📅" },
];

// ── Risk level config ──────────────────────────────────────
const RISK_CONFIG = {
  Low: {
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    bar: "bg-emerald-500",
    width: "w-1/4",
    emoji: "🟢",
  },
  Medium: {
    color: "text-yellow-600 dark:text-yellow-400",
    bg: "bg-yellow-500/10 border-yellow-500/20",
    bar: "bg-yellow-500",
    width: "w-2/4",
    emoji: "🟡",
  },
  High: {
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-500/10 border-orange-500/20",
    bar: "bg-orange-500",
    width: "w-3/4",
    emoji: "🟠",
  },
  Critical: {
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-500/10 border-red-500/20",
    bar: "bg-red-500",
    width: "w-full",
    emoji: "🔴",
  },
};

// ── Animation variants ─────────────────────────────────────
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

// ── API call ───────────────────────────────────────────────
async function fetchRiskSummary(
  payload: RiskForm,
): Promise<AiRiskSummaryResponse> {
  const { data } = await api.post("/api/farmer/ai-risk-summary", {
    cropName: payload.cropName,
    district: payload.district,
    season: payload.season,
    landArea: Number(payload.landArea),
    problemDescription: payload.problemDescription || undefined,
  });
  if (!data.success) throw new Error(data.message || "Analysis failed");
  return data.data as AiRiskSummaryResponse;
}

// ══════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ══════════════════════════════════════════════════════════
export default function AiRiskSummary() {
  const [result, setResult] = useState<AiRiskSummaryResponse | null>(null);

  const form = useForm<RiskForm>({
    resolver: zodResolver(riskFormSchema),
    defaultValues: {
      cropName: "",
      district: "",
      season: undefined,
      landArea: "",
      problemDescription: "",
    },
  });

  const {
    mutate: analyze,
    isPending,
    isError,
    error,
  } = useMutation({
    mutationFn: fetchRiskSummary,
    onSuccess: (data) => {
      setResult(data);
      toast.success("Risk analysis complete! 🌾");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Analysis failed. Please try again.");
    },
  });

  function handleReset() {
    setResult(null);
    form.reset();
  }

  const riskCfg = result
    ? (RISK_CONFIG[result.riskLevel] ?? RISK_CONFIG.Medium)
    : null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* ── Hero header ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl overflow-hidden bg-green-gradient p-6 text-white"
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center shrink-0">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="font-display text-xl font-bold">
                AI Crop Risk Summary
              </h1>
              <Badge className="bg-white/20 text-white border-white/30 text-xs">
                <Sparkles className="w-3 h-3 mr-1" />
                Gemini AI
              </Badge>
            </div>
            <p className="text-primary-200 text-sm">
              Get an instant AI-powered risk assessment for your crop — covering
              threats, actionable steps, and the right insurance schemes.
            </p>
          </div>
        </div>
        <div className="absolute top-3 right-5 text-5xl opacity-15 select-none">
          🌾
        </div>
      </motion.div>

      {/* ── Form card ── */}
      <AnimatePresence mode="wait">
        {!result ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            <Card className="border-border">
              <CardHeader className="pb-2 pt-5 px-6">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary-500" />
                  Farm Details
                </CardTitle>
                <Separator className="mt-3" />
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit((d) => analyze(d))}
                    className="space-y-5"
                  >
                    {/* Row 1: Crop + District */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="cropName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-medium flex items-center gap-1.5">
                              <Wheat className="w-3.5 h-3.5 text-primary-500" />
                              Crop Name{" "}
                              <span className="text-destructive">*</span>
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="h-11">
                                  <SelectValue placeholder="Select crop" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="max-h-60">
                                {CROP_TYPES.map((c) => (
                                  <SelectItem key={c} value={c}>
                                    {c}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="district"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-medium flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-primary-500" />
                              District{" "}
                              <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g. Aurangabad"
                                className="h-11"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Row 2: Season + Land Area */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="season"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-medium flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-primary-500" />
                              Season <span className="text-destructive">*</span>
                            </FormLabel>
                            <div className="grid grid-cols-2 gap-2">
                              {SEASONS.map((s) => (
                                <button
                                  key={s.value}
                                  type="button"
                                  onClick={() => field.onChange(s.value)}
                                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all
                                    ${
                                      field.value === s.value
                                        ? "border-primary-500 bg-primary-500/10 text-primary-600 dark:text-primary-400"
                                        : "border-border text-muted-foreground hover:border-primary-400/50"
                                    }`}
                                >
                                  <span>{s.emoji}</span>
                                  <span>{s.value}</span>
                                </button>
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="landArea"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-medium flex items-center gap-1.5">
                              <Ruler className="w-3.5 h-3.5 text-primary-500" />
                              Land Area (acres){" "}
                              <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  placeholder="e.g. 5.5"
                                  className="h-11 pr-14"
                                  type="number"
                                  step="0.1"
                                  min="0.1"
                                  {...field}
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">
                                  acres
                                </span>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Problem description */}
                    <FormField
                      control={form.control}
                      name="problemDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium flex items-center gap-1.5">
                            <MessageSquare className="w-3.5 h-3.5 text-primary-500" />
                            Problem Description
                            <span className="text-muted-foreground font-normal text-xs">
                              (optional)
                            </span>
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe any visible symptoms, weather events, pest activity, or concerns you've noticed..."
                              className="resize-none h-24"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription className="flex justify-between text-xs">
                            <span>More detail = more accurate analysis</span>
                            <span
                              className={
                                field.value && field.value.length > 900
                                  ? "text-destructive"
                                  : "text-muted-foreground"
                              }
                            >
                              {field.value?.length ?? 0}/1000
                            </span>
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Error banner */}
                    {isError && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-destructive/10 border border-destructive/20"
                      >
                        <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
                        <p className="text-xs text-destructive">
                          {(error as any)?.message ||
                            "Analysis failed. Please try again."}
                        </p>
                      </motion.div>
                    )}

                    {/* Submit */}
                    <Button
                      type="submit"
                      disabled={isPending}
                      className="w-full h-12 bg-primary-600 hover:bg-primary-700 text-white font-semibold shadow-green-glow hover:shadow-none transition-all gap-2"
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Analyzing with Gemini AI...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Analyze Risk</span>
                        </>
                      )}
                    </Button>

                    {/* Loading hint */}
                    {isPending && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center text-xs text-muted-foreground"
                      >
                        🤖 AI is evaluating crop risk, regional patterns, and
                        insurance options...
                      </motion.p>
                    )}
                  </form>
                </Form>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          /* ══════════════════════════════
           RESULTS PANEL
        ══════════════════════════════ */
          <motion.div
            key="results"
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            {/* ── Risk level hero ── */}
            <motion.div variants={item}>
              <Card className={`border ${riskCfg!.bg}`}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{riskCfg!.emoji}</div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium mb-0.5">
                          Overall Risk Level
                        </p>
                        <p
                          className={`text-2xl font-bold font-display ${riskCfg!.color}`}
                        >
                          {result.riskLevel}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleReset}
                      className="gap-2 shrink-0"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      New Analysis
                    </Button>
                  </div>
                  {/* Risk bar */}
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${riskCfg!.bar}`}
                      initial={{ width: 0 }}
                      animate={{ width: undefined }}
                      style={{ width: undefined }}
                      // Use inline className width progression
                    >
                      <div
                        className={`h-full rounded-full ${riskCfg!.bar} ${riskCfg!.width} transition-all duration-1000`}
                      />
                    </motion.div>
                  </div>
                  <div className="flex justify-between mt-1.5">
                    {["Low", "Medium", "High", "Critical"].map((l) => (
                      <span
                        key={l}
                        className={`text-xs font-medium ${result.riskLevel === l ? riskCfg!.color : "text-muted-foreground"}`}
                      >
                        {l}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* ── Possible risks ── */}
            <motion.div variants={item}>
              <Card className="border-border">
                <CardHeader className="pb-2 pt-5 px-6">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    Possible Risks
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {result.possibleRisks.length} identified
                    </Badge>
                  </CardTitle>
                  <Separator className="mt-3" />
                </CardHeader>
                <CardContent className="px-6 pb-5 space-y-2">
                  {result.possibleRisks.map((risk, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="flex items-start gap-3 p-3 rounded-xl bg-orange-500/5 border border-orange-500/10"
                    >
                      <span className="text-orange-500 mt-0.5 shrink-0">
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                      <p className="text-sm text-foreground leading-relaxed">
                        {risk}
                      </p>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* ── Recommendations ── */}
            <motion.div variants={item}>
              <Card className="border-border">
                <CardHeader className="pb-2 pt-5 px-6">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-yellow-500" />
                    Recommendations
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {result.recommendations.length} steps
                    </Badge>
                  </CardTitle>
                  <Separator className="mt-3" />
                </CardHeader>
                <CardContent className="px-6 pb-5 space-y-2">
                  {result.recommendations.map((rec, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="flex items-start gap-3 p-3 rounded-xl bg-primary-500/5 border border-primary-500/10"
                    >
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary-500/15 flex items-center justify-center mt-0.5">
                        <span className="text-xs font-bold text-primary-600 dark:text-primary-400">
                          {i + 1}
                        </span>
                      </span>
                      <p className="text-sm text-foreground leading-relaxed">
                        {rec}
                      </p>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* ── Insurance suggestions ── */}
            <motion.div variants={item}>
              <Card className="border-border">
                <CardHeader className="pb-2 pt-5 px-6">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-primary-500" />
                    Insurance Suggestions
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {result.insuranceSuggestions.length} schemes
                    </Badge>
                  </CardTitle>
                  <Separator className="mt-3" />
                </CardHeader>
                <CardContent className="px-6 pb-5 space-y-2">
                  {result.insuranceSuggestions.map((sug, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="flex items-start gap-3 p-3 rounded-xl bg-primary-500/8 border border-primary-500/15"
                    >
                      <FileText className="w-4 h-4 text-primary-500 shrink-0 mt-0.5" />
                      <p className="text-sm text-foreground leading-relaxed">
                        {sug}
                      </p>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* ── Disclaimer ── */}
            <motion.div variants={item}>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/50 border border-border">
                <Brain className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  This analysis is generated by Gemini AI based on the
                  information you provided. It is advisory only — consult a
                  local agricultural officer or Krishi Vigyan Kendra before
                  making major farming or insurance decisions.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
